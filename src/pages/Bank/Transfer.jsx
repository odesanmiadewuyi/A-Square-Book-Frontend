import { Card, Form, InputNumber, DatePicker, Input, Button, message, Row, Col } from 'antd';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

export default function BankTransfer() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const payload = {
        fromBankId: values.fromBankId,
        toBankId: values.toBankId,
        amount: values.amount,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
        description: values.description || '',
      };
      const { success, message: msg } = await request.post({ entity: 'bank/transfer', jsonData: payload });
      if (success) {
        message.success(msg || 'Transfer posted');
        form.resetFields();
      } else {
        message.error('Failed to post transfer');
      }
    } catch (e) {
      message.error('Failed to post transfer');
    }
  };

  return (
    <ErpLayout>
      <Card
        title="Bank Transfer"
        extra={
          <Button onClick={() => navigate('/reports/banktransfer/list?autoload=1')}>
            Print List
          </Button>
        }
        style={{ maxWidth: 760, margin: '0 auto', borderRadius: 12 }}
        bodyStyle={{ padding: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} size="middle">
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item name="fromBankId" label="From Bank" rules={[{ required: true }]}>
                <SelectAsync
                  entity={'bank'}
                  outputValue={'_id'}
                  displayLabels={['name', 'accountNumber']}
                  placeholder="Select source bank"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="toBankId" label="To Bank" rules={[{ required: true }]}>
                <SelectAsync
                  entity={'bank'}
                  outputValue={'_id'}
                  displayLabels={['name', 'accountNumber']}
                  placeholder="Select destination bank"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]} initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="date" label="Date" initialValue={dayjs()}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 12]} align="bottom">
            <Col xs={24} md={16}>
              <Form.Item name="description" label="Description">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block>
                  Post Transfer
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </ErpLayout>
  );
}
