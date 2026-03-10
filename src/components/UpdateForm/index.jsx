import { useEffect } from 'react';
import dayjs from 'dayjs';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectUpdatedItem } from '@/redux/crud/selectors';

import useLanguage from '@/locale/useLanguage';

import { Button, Form } from 'antd';
import Loading from '@/components/Loading';

const isFileLike = (value) => {
  if (!value || typeof value !== 'object') return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  return false;
};

const isDayjsLike = (value) => {
  if (!value || typeof value !== 'object') return false;
  if (dayjs.isDayjs(value)) return true;
  return value.$isDayjsObject === true || typeof value.toISOString === 'function';
};

const normalizePayload = (value) => {
  if (value === null || value === undefined) return value;
  if (isDayjsLike(value)) return value.toISOString();
  if (value instanceof Date) return value.toISOString();
  if (isFileLike(value)) return value;
  if (Array.isArray(value)) return value.map((item) => normalizePayload(item));
  if (typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((k) => {
      out[k] = normalizePayload(value[k]);
    });
    return out;
  }
  return value;
};

const prepareEntityPayload = (entity, values) => {
  const normalizedEntity = (entity || '').toString().toLowerCase();
  if (normalizedEntity === 'membershipaccountsetup') {
    const out = { ...values };
    const rawCode = (out.accountcode ?? '').toString().trim();
    if (rawCode) {
      out.accountcode = rawCode.split(/\s+/)[0];
    }
    return out;
  }
  if (normalizedEntity !== 'membershippayment') return values;

  const out = { ...values };
  const toId = (v) => {
    if (!v || typeof v !== 'object') return v;
    return v._id ?? v.value ?? v.id ?? v;
  };

  out.name = (out.name || '').toString().trim();
  out.category = toId(out.category);
  out.categoryType = toId(out.categoryType);
  out.bank = toId(out.bank);
  out.tellerNumber = (out.tellerNumber || '').toString().trim().toUpperCase();
  out.description = (out.description || '').toString().trim();
  if (out.amount !== undefined && out.amount !== null && out.amount !== '') {
    out.amount = Number(out.amount);
  }
  if (out.payDate && typeof out.payDate.toISOString === 'function') {
    out.payDate = out.payDate.toISOString();
  } else if (typeof out.payDate === 'string' && out.payDate.trim()) {
    const parsedPayDate = dayjs(out.payDate);
    if (parsedPayDate.isValid()) out.payDate = parsedPayDate.toISOString();
  }
  // Backward-compatible aliases for older API payload contracts.
  out.memberId = out.name;
  out.categoryId = out.category;
  out.categoryTypeId = out.categoryType;
  out.bankId = out.bank;
  out.date = out.payDate;
  out.tellerNo = out.tellerNumber;
  out.reference = out.referenceNumber;

  return out;
};

export default function UpdateForm({ config, formElements, withUpload = false }) {
  let { entity, centerForm = false, formMaxWidth = 520 } = config;
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);

  const { state, crudContextAction } = useCrudContext();

  /////

  const { panel, collapsedBox, readBox } = crudContextAction;

  const showCurrentRecord = () => {
    readBox.open();
  };

  /////
  const [form] = Form.useForm();

  const onSubmit = (fieldsValue) => {
    const id = current._id;
    const payload = { ...fieldsValue };
    if (withUpload) {
      const selected = Array.isArray(payload.file) ? payload.file[0] : payload.file;
      if (selected?.originFileObj) {
        payload.file = selected.originFileObj;
      } else if (isFileLike(selected)) {
        payload.file = selected;
      } else {
        delete payload.file;
      }
    }
    const normalized = normalizePayload(prepareEntityPayload(entity, payload));
    dispatch(crud.update({ entity, id, jsonData: normalized, withUpload }));
  };
  useEffect(() => {
    if (current) {
      let newValues = { ...current };
      if ((entity || '').toString().toLowerCase() === 'membershippayment' && newValues.payDate) {
        const parsedPayDate = dayjs(newValues.payDate);
        newValues = {
          ...newValues,
          payDate: parsedPayDate.isValid() ? parsedPayDate.format('YYYY-MM-DD') : undefined,
        };
      }
      if (newValues.birthday) {
        newValues = {
          ...newValues,
          birthday: dayjs(newValues['birthday']).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        };
      }
      if (newValues.date) {
        newValues = {
          ...newValues,
          date: dayjs(newValues['date']).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        };
      }
      if (newValues.expiredDate) {
        newValues = {
          ...newValues,
          expiredDate: dayjs(newValues['expiredDate']).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        };
      }
      if (newValues.created) {
        newValues = {
          ...newValues,
          created: dayjs(newValues['created']).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        };
      }
      if (newValues.updated) {
        newValues = {
          ...newValues,
          updated: dayjs(newValues['updated']).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        };
      }
      form.resetFields();
      form.setFieldsValue(newValues);
    }
  }, [current]);

  useEffect(() => {
    if (isSuccess) {
      readBox.open();
      collapsedBox.open();
      panel.open();
      form.resetFields();
      dispatch(crud.resetAction({ actionType: 'update' }));
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess]);

  const { isEditBoxOpen } = state;

  const show = isEditBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  return (
    <div style={show}>
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          layout="vertical"
          name={`${entity}-update-form`}
          preserve={false}
          onFinish={onSubmit}
          style={centerForm ? { maxWidth: formMaxWidth, margin: '0 auto' } : undefined}
        >
          {formElements}
          <div style={centerForm ? { textAlign: 'center' } : undefined}>
            <Form.Item
              style={{
                display: 'inline-block',
                paddingRight: '5px',
              }}
            >
              <Button type="primary" htmlType="submit">
                {translate('Save')}
              </Button>
            </Form.Item>
            <Form.Item
              style={{
                display: 'inline-block',
                paddingLeft: '5px',
              }}
            >
              <Button onClick={showCurrentRecord}>{translate('Cancel')}</Button>
            </Form.Item>
          </div>
        </Form>
      </Loading>
    </div>
  );
}
