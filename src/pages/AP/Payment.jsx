import { Form, Input, InputNumber, DatePicker, Button, message, Row, Col, Divider, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { ErpLayout } from '@/layout';
import useCanForm from '@/auth/useCanForm';

export default function APPayment() {
  const [form] = Form.useForm();
  const [nextNumber, setNextNumber] = useState('');
  const navigate = useNavigate();
  const canForm = useCanForm('ap');
  const canCreate = canForm('ap_payment_create', 'ap');

  useEffect(() => {
    if (!canCreate) {
      message.error('Access denied');
      navigate('/');
    }
  }, [canCreate]);
  if (!canCreate) return null;

  useEffect(() => {
    (async () => {
      try {
        const { success, result } = await request.get({ entity: 'ap/payment/next-number' });
        if (success && result) setNextNumber(result.display || '');
      } catch {}
    })();
  }, []);

  const onSubmit = async (vals) => {
    try {
      const payload = {
        billId: vals.billId,
        bankId: vals.bankId,
        amount: Number(vals.amount || 0) || 0,
        date: vals.date?.toISOString?.() || vals.date,
        description: vals.description || '',
        whtAmount: Number(vals.whtAmount || 0) || 0,
        whtPayableCode: vals.whtPayableCode || undefined,
      };
      const { success } = await request.post({ entity: 'ap/payment', jsonData: payload });
      if (success) { message.success('AP Payment posted'); form.resetFields(); }
    } catch (e) { message.error('Failed to post AP Payment'); }
  };

  return (
    <ErpLayout>
      <div style={{ maxWidth: 900 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>AP Payment</Typography.Title>
        <Form form={form} layout='vertical' onFinish={onSubmit} style={{ marginTop: 8 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item label='Payment Number'>
                <Input value={nextNumber} readOnly />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='date' label='Payment Date' rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Typography.Title level={5}>References</Typography.Title>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item name='billId' label='Bill' rules={[{ required: true }]}> 
                {/**
                 * Only show bills that are payable:
                 * - type: bill
                 * - status: open (created after approval, not yet fully settled)
                 * We combine exact filter (type) with a text filter over status via fields+q,
                 * which the backend paginatedList merges into the Mongo query.
                 */}
                <SelectAsync
                  entity={'ap/transaction'}
                  outputValue={'_id'}
                  displayLabels={['description','amount']}
                  placeholder='Select bill'
                  listOptions={{ filter: 'type', equal: 'bill', fields: 'status', q: 'open' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='bankId' label='Bank' rules={[{ required: true }]}>
                <SelectAsync entity={'bank'} outputValue={'_id'} displayLabels={['name','accountNumber']} placeholder='Select bank' />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Typography.Title level={5}>Amounts</Typography.Title>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8}>
              <Form.Item name='amount' label='Amount' rules={[{ required: true }]}> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name='whtAmount' label='WHT Amount'>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name='whtPayableCode' label='WHT Payable Posting Code'>
                <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select WHT payable account' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='description' label='Description'>
            <Input.TextArea rows={2} />
          </Form.Item>

          <div style={{ marginTop: 8 }}>
            <Button type='primary' htmlType='submit'>Post Payment</Button>
          </div>
        </Form>
      </div>
    </ErpLayout>
  );
}
