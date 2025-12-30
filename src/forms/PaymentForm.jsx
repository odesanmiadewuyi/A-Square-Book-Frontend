import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Row, Col, DatePicker } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { useDate } from '@/settings';

import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { request } from '@/request';

export default function PaymentForm({ maxAmount = null, isUpdateForm = false, voucherNumber = '' }) {
  const translate = useLanguage();
  const { TextArea } = Input;
  const { dateFormat } = useDate();
  const { last_payment_number } = useSelector(selectFinanceSettings) || {};
  const nextRef = `PA-${String((Number(last_payment_number) || 0) + 1).padStart(6, '0')}`;
  const remaining = Number(maxAmount || 0);
  const isFullyPaid = remaining <= 0;
  const displayAmount = Number.isFinite(remaining) ? Math.max(0, Number(remaining.toFixed(2))) : undefined;
  const form = Form.useFormInstance();

  useEffect(() => {
    (async () => {
      try {
        const resp = await request.get({ entity: 'payment/next-ref' });
        const ref = resp?.result?.ref;
        if (ref) form.setFieldsValue({ ref });
      } catch (e) {
        form.setFieldsValue({ ref: nextRef });
      }
    })();
  }, []);
  return (
    <div className="compactForm">
      <Row gutter={[12, 8]} style={{ margin: 0 }}>
        {voucherNumber && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label={translate('Voucher Number') || 'Voucher Number'} style={{ marginBottom: 0 }}>
              <Input value={voucherNumber} disabled size="small" />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            label={translate('number')}
            name="number"
            initialValue={1}
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1} style={{ width: '100%' }} size="small" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name="date"
            label={translate('date')}
            rules={[{ required: true, type: 'object' }]}
            initialValue={dayjs()}
            style={{ marginBottom: 0 }}
          >
            <DatePicker format={dateFormat} style={{ width: '100%' }} size="small" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            label={translate('amount')}
            name="amount"
            initialValue={displayAmount}
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              className="moneyInput"
              min={isFullyPaid ? 0 : 0.01}
              step={0.01}
              controls={false}
              max={maxAmount}
              size="small"
              disabled={isFullyPaid}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            label={translate('payment Mode')}
            name="paymentMode"
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <SelectAsync
              entity={'paymentMode'}
              displayLabels={['name']}
              withRedirect={true}
              urlToRedirect="/payment/mode"
              redirectLabel="Add Payment Mode"
              size="small"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            label={translate('Bank') || 'Bank'}
            name="bank"
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <SelectAsync
              entity={'bank'}
              displayLabels={['name']}
              withRedirect={true}
              urlToRedirect="/bank"
              redirectLabel={translate('Add Bank') || 'Add Bank'}
              size="small"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item label={translate('Reference')} name="ref" style={{ marginBottom: 0 }}>
            <Input size="small" disabled />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item
            label={translate('Teller/Cheque No') || 'Teller/Cheque No'}
            name="tellerNo"
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <Input size="small" placeholder={translate('Enter teller or cheque number')} />
          </Form.Item>
        </Col>
        {isFullyPaid && (
          <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="compactForm__note">
              {translate('Invoice already fully paid') || 'Invoice already fully paid'}
            </div>
          </Col>
        )}

        <Col span={24}>
          <Form.Item label={translate('Description')} name="description" style={{ marginBottom: 0 }}>
            <TextArea autoSize={{ minRows: 1, maxRows: 2 }} size="small" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
