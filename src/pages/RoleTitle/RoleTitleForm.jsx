import React from 'react';
import { Form, Input, Switch } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';

export default function RoleTitleForm() {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        name='department'
        label={translate('Department') || 'Department'}
        rules={[{ required: true, message: translate('Department is required') || 'Department is required' }]}
      >
        <SelectAsync
          entity={'department'}
          outputValue={'_id'}
          displayLabels={['name']}
          placeholder={translate('Select Department') || 'Select Department'}
        />
      </Form.Item>
      <Form.Item name='name' label={translate('Role/Title') || 'Role/Title'} rules={[{ required: true }]}> 
        <Input placeholder={translate('Enter role or title') || 'Enter role or title'} />
      </Form.Item>
      <Form.Item name='description' label={translate('Description') || 'Description'}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name='active' label={translate('Active') || 'Active'} valuePropName='checked' initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}

