import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectCreatedItem } from '@/redux/crud/selectors';

import useLanguage from '@/locale/useLanguage';

import { Button, Form, message } from 'antd';
import Loading from '@/components/Loading';
import dayjs from 'dayjs';

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

export default function CreateForm({ config, formElements, withUpload = false }) {
  let { entity, stayOnCreateAfterSave = false, centerForm = false, formMaxWidth = 520 } = config;
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;
  const [form] = Form.useForm();
  const translate = useLanguage();
  const onSubmit = (fieldsValue) => {
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
    dispatch(crud.create({ entity, jsonData: normalized, withUpload }));
  };

  useEffect(() => {
    if (isSuccess) {
      if ((entity || '').toString().toLowerCase() === 'membershippayment') {
        message.success('Successful submitted for review');
      }

      if (stayOnCreateAfterSave) {
        panel.open();
        collapsedBox.close();
        readBox.close();
      } else {
        readBox.open();
        collapsedBox.open();
        panel.open();
      }
      form.resetFields();
      dispatch(crud.resetAction({ actionType: 'create' }));
      dispatch(crud.list({ entity }));
    }
  }, [
    isSuccess,
    stayOnCreateAfterSave,
    entity,
    dispatch,
    form,
    panel,
    collapsedBox,
    readBox,
  ]);

  return (
    <Loading isLoading={isLoading}>
      <Form
        form={form}
        layout="vertical"
        name={`${entity}-create-form`}
        preserve={false}
        onFinish={onSubmit}
        style={centerForm ? { maxWidth: formMaxWidth, margin: '0 auto' } : undefined}
      >
        {formElements}
        <Form.Item style={centerForm ? { textAlign: 'center' } : undefined}>
          <Button type="primary" htmlType="submit">
            {translate('Submit')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
