import { Form, Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

export default function SettingsForm(){
  return (
    <>
      <Form.Item
        name='budget_enabled'
        label='Enable Budget'
        tooltip='Turn on to enforce and use budgeting features. Turn off to disable budget enforcement.'
        valuePropName='checked'
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
    </>
  );
}

