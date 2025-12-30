import { useEffect, useState } from 'react';
import { ErpLayout } from '@/layout';
import { Form, Input, InputNumber, DatePicker, Button, message, Row, Col } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';
import calculate from '@/utils/calculate';

export default function APCustomerInvoicePay() {
  const [form] = Form.useForm();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const [current, setCurrent] = useState(null);

  const loadInvoice = async (id) => {
    if (!id || id === 'redirectURL') return;
    try {
      const { success, result } = await request.read({ entity: 'apcustomerinvoice', id });
      if (success) setCurrent(result);
    } catch {}
  };

  const onSubmit = async (vals) => {
    if (!current?._id) return;
    try {
      const roundedAmount = calculate.round2(vals.amount);
      const payload = {
        bankId: vals.bankId,
        amount: Number(roundedAmount || 0) || 0,
        date: vals.date?.toISOString?.() || vals.date,
        description: vals.description || '',
        tellerNo: vals.tellerNo || '',
      };
      const { success, message: msg } = await request.post({ entity: `apcustomerinvoice/pay/${current._id}`, jsonData: payload });
      if (success) {
        message.success('Payment recorded');
        form.resetFields();
        setCurrent(null);
      } else {
        if (msg) message.error(msg);
      }
    } catch (e) { message.error('Failed to record payment'); }
  };

  const due = Math.max(((current?.total || 0) - (current?.credit || 0)), 0);
  const dueRounded = calculate.round2(due);

  useEffect(() => {
    if (current) {
      form.setFieldsValue({ amount: dueRounded, date: dayjs(), description: `Payment for ${current.voucherNumber || ''}` });
    }
  }, [current, dueRounded]);

  return (
    <ErpLayout>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 12px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e6edf3',
            padding: 20,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Pay Customer-Invoice (AP)
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Record the payment details for the selected customer invoice.
          </div>
          <Form form={form} layout='vertical' onFinish={onSubmit} size='middle'>
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <Form.Item name='invoiceId' label='Customer-Invoice' rules={[{ required: true }]}> 
                  <SelectAsync
                    entity={'apcustomerinvoice'}
                    outputValue={'_id'}
                    displayLabels={['voucherNumber']}
                    placeholder={'Select approved invoice'}
                    listOptions={{ filter: 'approved', equal: true }}
                    onChange={(id) => loadInvoice(id)}
                    remoteSearch={true}
                  />
                </Form.Item>
              </Col>
              {current && (
                <Col xs={24} md={12}>
                  <Form.Item label='Client'>
                    <Input value={current?.client?.name || ''} readOnly />
                  </Form.Item>
                </Col>
              )}
            </Row>
            {current && (
              <>
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Form.Item label='Number'>
                      <Input value={current?.voucherNumber || current?.displayNumber || ''} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label='Total Due'>
                      <Input value={moneyFormatter({ amount: due, currency_code: current?.currency || 'NGN' })} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='bankId' label='Bank' rules={[{ required: true }]}> 
                      <SelectAsync entity={'bank'} outputValue={'_id'} displayLabels={['name','accountNumber']} placeholder='Select bank' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='date' label='Payment Date' rules={[{ required: true }]}> 
                      <DatePicker style={{ width: '100%' }} format={dateFormat} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='amount' label='Amount' rules={[{ required: true }]}> 
                      <InputNumber min={0} precision={2} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='tellerNo' label='Teller/Cheque No'>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='description' label='Description'>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <Button type='primary' htmlType='submit'>Record Payment</Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </ErpLayout>
  );
}

