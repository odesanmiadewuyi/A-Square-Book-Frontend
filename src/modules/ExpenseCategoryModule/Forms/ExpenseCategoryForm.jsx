import { Form, Input, Select, Switch } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function ExpenseCategoryForm() {
  const translate = useLanguage();
  const colorOptions = ['green', 'blue', 'crimson', 'orange', 'purple', 'volcano', 'gold'].map((c)=>({label:c, value:c}));
  return (
    <>
      <Form.Item name="name" label={translate('name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label={translate('description')}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="color" label={translate('Color')}>
        <Select options={colorOptions} allowClear />
      </Form.Item>
      <Form.Item name="enabled" label={translate('Enabled')} valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}

