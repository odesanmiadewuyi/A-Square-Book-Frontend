import React from 'react';
import { Form, Input, Switch, DatePicker, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function AutoForm({ fields = {} }) {
  const translate = useLanguage();

  const renderField = (key, field) => {
    const label = field.label ? translate(field.label) : translate(key);
    const rules = [];
    if (field.required) rules.push({ required: true });
    // Additional validation rules
    if (Array.isArray(field.rules)) {
      field.rules.forEach((r) => rules.push(r));
    }
    if (field.type === 'email') {
      rules.push({ type: 'email', message: 'Please enter a valid email address' });
    }

    const commonProps = { placeholder: field.placeholder };
    let inputEl = <Input {...commonProps} disabled={field.disabled} />;

    switch (field.type) {
      case 'boolean':
        return (
          <Form.Item key={key} name={key} label={label} valuePropName="checked">
            <Switch disabled={field.disabled} />
          </Form.Item>
        );
      case 'date':
        inputEl = <DatePicker style={{ width: '100%' }} disabled={field.disabled} />;
        break;
      case 'textarea':
        inputEl = <Input.TextArea rows={4} disabled={field.disabled} {...commonProps} />;
        break;
      case 'email':
        inputEl = <Input type="email" disabled={field.disabled} {...commonProps} />;
        break;
      case 'select':
        inputEl = (
          <Select
            disabled={field.disabled}
            options={(field.options || []).map((o) => ({ label: o.label || o.value, value: o.value }))}
          />
        );
        break;
      default:
        inputEl = <Input {...commonProps} disabled={field.disabled} />;
        break;
    }

    return (
      <Form.Item key={key} name={key} label={label} rules={rules}>
        {inputEl}
      </Form.Item>
    );
  };

  return <>{Object.keys(fields).map((key) => renderField(key, fields[key]))}</>;
}
