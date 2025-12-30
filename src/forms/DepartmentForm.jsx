import { Form, Input, Switch } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function DepartmentForm({ isUpdateForm = false }) {
  const translate = useLanguage();

  return (
    <>
      <Form.Item name="name" label={translate('Department Name') || 'Department Name'} rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="code" label={translate('Code') || 'Code'}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label={translate('Description') || 'Description'}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item name="enabled" label={translate('enabled') || 'Enabled'} valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}

