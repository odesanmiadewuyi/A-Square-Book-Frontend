import { useState, useEffect } from 'react';
import { Form, Divider, message } from 'antd';
import dayjs from 'dayjs';
import { Button, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';

import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import Loading from '@/components/Loading';

import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { settingsAction } from '@/redux/settings/actions';
// import { StatusTag } from '@/components/Tag';
import { request } from '@/request';
import usePermissionConfig from '@/auth/usePermissionConfig';

function SaveForm({ form, translate }) {
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('update')}
    </Button>
  );
}

export default function UpdateItem({ config, UpdateForm }) {
  const translate = useLanguage();
  const { effectiveConfig, formKeys, moduleKey, canForm } = usePermissionConfig(config);
  let { entity, pathPrefix } = effectiveConfig;
  const basePath = `/${(pathPrefix || (entity || '').toLowerCase())}`;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  // For GLJournal update flow
  const [journalLines, setJournalLines] = useState([]);
  const [journalHeaderDesc, setJournalHeaderDesc] = useState('');

  const resetErp = {
    status: '',
    client: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  const [currentErp, setCurrentErp] = useState(current ?? resetErp);

  const { id } = useParams();
  const canUpdate = canForm(formKeys.update || formKeys.edit, moduleKey);

  useEffect(() => {
    if (!canUpdate) {
      message.error(translate('Access denied for this action') || 'Access denied for this action');
      navigate('/');
    }
  }, [canUpdate]);
  if (!canUpdate) return null;

  const handelValuesChange = (changedValues, values) => {
    const items = values['items'];
    let subTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          if (item.quantity && item.price) {
            let total = calculate.multiply(item['quantity'], item['price']);
            //sub total
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
    }
  };

  const onSubmit = async (fieldsValue) => {
    let dataToUpdate = { ...fieldsValue };
    if (fieldsValue) {
      if (fieldsValue.date || fieldsValue.expiredDate) {
        dataToUpdate.date = dayjs(fieldsValue.date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        dataToUpdate.expiredDate = dayjs(fieldsValue.expiredDate).format(
          'YYYY-MM-DDTHH:mm:ss.SSSZ'
        );
      }
      if (fieldsValue.items) {
        let newList = [];
        fieldsValue.items.map((item) => {
          const { quantity, price, itemName, description } = item;
          const total = item.quantity * item.price;
          newList.push({ total, quantity, price, itemName, description });
        });
        dataToUpdate.items = newList;
      }
      // Compute totals for GLJournal and stage lines for sync
      if (entity === 'gljournal' && Array.isArray(fieldsValue.lines)) {
        const normalized = fieldsValue.lines.map((l)=>({
          ...l,
          particular: ((l?.particular ?? '') + '').trim(),
        }));
        const sum = (arr, key) => arr.reduce((acc, it) => acc + (parseFloat(it?.[key]) || 0), 0);
        const totalDebit = sum(normalized, 'debit');
        const totalCredit = sum(normalized, 'credit');
        dataToUpdate.totalDebit = totalDebit;
        dataToUpdate.totalCredit = totalCredit;
        const balanced = Math.abs((totalDebit || 0) - (totalCredit || 0)) < 0.0001;
        if (!balanced) {
          message.error('Total Debit must equal Total Credit');
          return; // block update
        }
        // Persist lines immediately using current form values to avoid race on state
        try {
          await request.post({ entity: 'gljournalline/purge', jsonData: { journal: id } });
          const payloads = normalized.map((l, idx) => ({
            journal: id,
            lineNo: idx + 1,
            accountCode: l.postingcode || l.accountCode,
            particular: (typeof l.particular === 'string') ? l.particular.trim() : '',
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          }));
          if (payloads.length) {
            await Promise.all(payloads.map((p) => request.post({ entity: 'gljournalline/create', jsonData: p })));
          }
        } catch (e) {
          console.error('Failed to write journal lines', e);
          message.error('Failed to save journal lines');
          return;
        }
      }
    }

    dispatch(erp.update({ entity, id, jsonData: dataToUpdate }));
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      setSubTotal(0);
      dispatch(erp.resetAction({ actionType: 'update' }));
      navigate(`${basePath}/read/${id}`);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (current) {
      setCurrentErp(current);
      let formData = { ...current };
      if (formData.date) {
        formData.date = dayjs(formData.date);
      }
      if (formData.expiredDate) {
        formData.expiredDate = dayjs(formData.expiredDate);
      }
      if (!formData.taxRate) {
        formData.taxRate = 0;
      }

      const { subTotal } = formData;

      form.resetFields();
      form.setFieldsValue(formData);
      setSubTotal(subTotal);
    }
  }, [current]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(basePath);
        }}
        title={translate('update')}
        ghost={false}
        tags={[
          <span key="status">{currentErp.status && translate(currentErp.status)}</span>,
          currentErp.paymentStatus && (
            <span key="paymentStatus">
              {currentErp.paymentStatus && translate(currentErp.paymentStatus)}
            </span>
          ),
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(basePath);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm translate={translate} form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit} onValuesChange={handelValuesChange}>
          <UpdateForm subTotal={subTotal} current={current} />
        </Form>
      </Loading>
    </>
  );
}
