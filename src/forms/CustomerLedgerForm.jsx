import { Form, Input } from 'antd';
import SelectAsync from '@/components/SelectAsync';

export default function CustomerLedgerForm({ isUpdateForm = false }) {
  const form = Form.useFormInstance();

  const handleValueChange = (val) => {
    form.setFieldsValue({ code: val });
  };
  const handleRecord = (record) => {
    if (record) {
      const name = record?.name || '';
      form.setFieldsValue({ name });
    }
  };

  return (
    <>
      <Form.Item
        label='Customer Account'
        name='code'
        tooltip='Select an existing posting account'
        rules={[{ required: true, message: 'Customer Account is required' }]}
      >
        <SelectAsync
          entity={'postingaccount'}
          outputValue={'postingcode'}
          displayLabels={['postingcode', 'name']}
          placeholder={'Select posting account'}
          listOptions={{ filter: 'enabled', equal: true }}
          onChange={handleValueChange}
          onSelectRecord={handleRecord}
          disabled={isUpdateForm}
          value={isUpdateForm ? form.getFieldValue('code') : undefined}
        />
      </Form.Item>
      <Form.Item name='name' hidden>
        <Input />
      </Form.Item>
      <Form.Item label='Description' name='description'>
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );
}
