import { Form, Input, InputNumber, DatePicker, Button, message, Row, Col, Divider, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { ErpLayout } from '@/layout';
import useCanForm from '@/auth/useCanForm';

export default function APBill() {
  const [form] = Form.useForm();
  const [nextNumber, setNextNumber] = useState('');
  const navigate = useNavigate();
  const canForm = useCanForm('ap');
  const canCreate = canForm('ap_bill_create', 'ap');

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
        const { success, result } = await request.get({ entity: 'ap/bill/next-number' });
        if (success && result) {
          setNextNumber(result.display || '');
        }
      } catch {}
    })();
  }, []);

  const onSubmit = async (vals) => {
    try {
      const payload = {
        vendorId: vals.vendorId,
        vendorModel: 'Company',
        amount: Number(vals.amount || 0) || 0,
        date: vals.date?.toISOString?.() || vals.date,
        description: vals.description || '',
        expenseCode: vals.expenseCode,
        apControl: vals.apControl,
        vatAmount: Number(vals.vatAmount || 0) || 0,
        vatInputCode: vals.vatInputCode || undefined,
      };
      const { success } = await request.post({ entity: 'ap/bill', jsonData: payload });
      if (success) { message.success('AP Bill posted'); form.resetFields(); }
    } catch (e) { message.error('Failed to post AP Bill'); }
  };

  return (
    <ErpLayout>
      <div style={{ maxWidth: 900 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>AP Bill (Non-PO)</Typography.Title>
        <Form form={form} layout='vertical' onFinish={onSubmit} style={{ marginTop: 8 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item label='Bill Number'>
                <Input value={nextNumber} readOnly />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='date' label='Posting Date' rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Typography.Title level={5}>Vendor</Typography.Title>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item name='vendorId' label='Vendor' rules={[{ required: true }]}>
                <SelectAsync entity={'company'} outputValue={'_id'} displayLabels={['name']} placeholder='Select vendor' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='description' label='Description'>
                <Input.TextArea rows={2} />
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
              <Form.Item name='vatAmount' label='VAT Amount'>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name='vatInputCode' label='VAT Input Posting Code'>
                <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select VAT input account' />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Typography.Title level={5}>Posting</Typography.Title>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item name='expenseCode' label='Expense Posting Code' rules={[{ required: true }]}>
                <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select expense account' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='apControl' label='Accounts Payable Control' rules={[{ required: true }]}>
                <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select Accounts Payable Control account' />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 8 }}>
            <Button type='primary' htmlType='submit'>Post Bill</Button>
          </div>
        </Form>
      </div>
    </ErpLayout>
  );
}
