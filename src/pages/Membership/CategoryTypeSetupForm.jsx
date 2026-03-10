import React from 'react';
import { Form, Input, InputNumber, Switch } from 'antd';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';

export default function CategoryTypeSetupForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const currentId = Form.useWatch('_id', form);
  const currentRef = Form.useWatch('categoryTypeId', form);

  const buildDefaultReferenceNumber = () => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const hms = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
      2,
      '0'
    )}${String(now.getSeconds()).padStart(2, '0')}`;
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `CTY-${ymd}-${hms}${rand}`;
  };

  React.useEffect(() => {
    // Only auto-fill on create mode. Keep existing value on update mode.
    if (currentId) return;
    if ((currentRef || '').toString().trim()) return;
    form.setFieldsValue({ categoryTypeId: buildDefaultReferenceNumber() });
  }, [currentId, currentRef, form]);

  const numericKeyGuard = (evt) => {
    if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
    if (allowedKeys.includes(evt.key)) return;
    if (/^[0-9.]$/.test(evt.key)) return;
    evt.preventDefault();
  };

  const amountParser = (value) => {
    if (value === undefined || value === null) return '';
    const cleaned = value.toString().replace(/[^\d.]/g, '');
    const [whole = '', ...decimals] = cleaned.split('.');
    return decimals.length ? `${whole}.${decimals.join('')}` : whole;
  };

  return (
    <>
      <Form.Item label={translate('Reference Number') || 'Reference Number'} name="categoryTypeId">
        <Input
          disabled
          placeholder={translate('Auto-generated') || 'Auto-generated'}
        />
      </Form.Item>

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
        label={translate('Category Type') || 'Category Type'}
        name="categoryType"
        rules={[{ required: true, message: 'Please enter category type' }]}
      >
        <Input placeholder={translate('Enter Category Type') || 'Enter Category Type'} />
      </Form.Item>

      <Form.Item
        label={translate('Amount') || 'Amount'}
        name="amount"
        rules={[
          { required: true, message: 'Please enter amount' },
          {
            validator: (_, value) => {
              const num = Number(value);
              return Number.isFinite(num) && num >= 0
                ? Promise.resolve()
                : Promise.reject(new Error('Amount must be a valid number'));
            },
          },
        ]}
      >
        <InputNumber
          min={0}
          precision={2}
          step={0.01}
          inputMode="decimal"
          parser={amountParser}
          onKeyDown={numericKeyGuard}
          style={{ width: '100%' }}
        />
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
