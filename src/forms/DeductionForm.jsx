import { Form, Input, DatePicker, InputNumber } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import useLanguage from '@/locale/useLanguage';

// Generic deduction form: used for VAT, WHT, Stamp Duty deductions
export default function DeductionForm({ amountField = 'amount', amountLabel = 'Amount' }) {
  const translate = useLanguage();
  return (
    <>
      <Form.Item name={'clientID'} label={translate('Client')} rules={[{ required: true }]}>
        <AutoCompleteAsync entity={'client'} displayLabels={['name']} searchFields={'name'} withRedirect redirectLabel={'Add New Client'} urlToRedirect={'/customer'} />
      </Form.Item>
      <Form.Item name={'number'} label={translate('number')} rules={[{ required: true }]}>
        <Input placeholder={'e.g. INV-000001'} />
      </Form.Item>
      <Form.Item name={'date'} label={translate('Date')} rules={[{ required: true, type: 'object' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={'note'} label={translate('Note')}>
        <Input />
      </Form.Item>
      <Form.Item name={'subTotal'} label={'Sub Total'} rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={amountField} label={amountLabel} rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={'total'} label={'Total'} rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </>
  );
}

