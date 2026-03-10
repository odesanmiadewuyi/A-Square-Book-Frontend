import React from 'react';
import { Form, Input, InputNumber, Switch } from 'antd';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';

export default function CategoryPaymentSetupForm() {
  const translate = useLanguage();

  return (
    <>
      <Form.Item
        label={translate('Category Name') || 'Category Name'}
        name="category"
        rules={[{ required: true, message: 'Please select category' }]}
      >
        <SelectAsync
          entity={'membershipcategory'}
          outputValue={'_id'}
          displayLabels={['code', 'name']}
          placeholder={translate('Select Category') || 'Select Category'}
        />
      </Form.Item>

      <Form.Item
        label={translate('Amount') || 'Amount'}
        name="amount"
        rules={[{ required: true, message: 'Please enter amount' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label={translate('Description') || 'Description'} name="description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        label={translate('Active') || 'Active'}
        name="active"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </>
  );
}
