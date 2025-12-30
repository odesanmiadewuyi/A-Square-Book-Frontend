import { useState, useEffect } from 'react';
import { Form, Button } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectRecordPaymentItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';

import PaymentForm from '@/forms/PaymentForm';
import { formatVoucherNumber } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';
import calculate from '@/utils/calculate';

export default function RecordPayment({ config }) {
  const navigate = useNavigate();
  const translate = useLanguage();
  let { entity } = config;

  const dispatch = useDispatch();

  const { isLoading, isSuccess, current: currentInvoice } = useSelector(selectRecordPaymentItem);

  const [form] = Form.useForm();

  const [maxAmount, setMaxAmount] = useState(0);
  useEffect(() => {
    if (currentInvoice) {
      const { credit, total, discount } = currentInvoice;
      setMaxAmount(calculate.sub(calculate.sub(total, discount), credit));
    }
  }, [currentInvoice]);
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity}/`);
    }
  }, [isSuccess]);

  const onSubmit = (fieldsValue) => {
    if (currentInvoice) {
      const { _id: invoice } = currentInvoice;
      const client = currentInvoice.client && currentInvoice.client._id;
      fieldsValue = {
        ...fieldsValue,
        invoice,
        client,
      };
    }

    dispatch(
      erp.recordPayment({
        entity: 'payment',
        jsonData: fieldsValue,
      })
    );
  };

  return (
    <Loading isLoading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <PaymentForm
          maxAmount={maxAmount}
          voucherNumber={
            (currentInvoice && (currentInvoice.voucherNumber || currentInvoice.displayNumber)) ||
            (currentInvoice?.number ? formatVoucherNumber(currentInvoice.number) : '')
          }
        />
        <Form.Item className="compactForm__actions">
          <Button type="primary" htmlType="submit" size="small" disabled={maxAmount <= 0}>
            {translate('Record Payment')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
