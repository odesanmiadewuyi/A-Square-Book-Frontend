import { Form, Input, InputNumber, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import currencyList from '@/utils/currencyList';
import { useEffect } from 'react';

export default function OrderForm() {
  const translate = useLanguage();
  const currencyOptions = currencyList.map((c) => ({ label: `${c.flag} ${c.currency_code}`, value: c.currency_code }));

  // Keep total in sync when price/quantity/discount change
  const [form] = Form.useFormInstance ? [Form.useFormInstance()] : [null];
  useEffect(() => {
    if (!form) return;
    const unsubscribe = form.subscribe?.(({ values }) => {
      const q = Number(values?.quantity || 0);
      const p = Number(values?.price || 0);
      const d = Number(values?.discount || 0);
      const t = Math.max(0, q * p - d);
      form.setFieldsValue({ total: t });
    });
    return unsubscribe;
  }, [form]);

  return (
    <>
      <Form.Item name="number" label={translate('number')} rules={[{ required: true }]} initialValue={1}>
        <InputNumber style={{ width: '100%' }} min={1} />
      </Form.Item>
      <Form.Item name="name" label={translate('name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="product" label={translate('product')} rules={[{ required: true }]}>
        <SelectAsync entity={'product'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('product')} />
      </Form.Item>
      <Form.Item name="quantity" label={translate('quantity')} rules={[{ required: true }]} initialValue={1}>
        <InputNumber style={{ width: '100%' }} min={1} />
      </Form.Item>
      <Form.Item name="currency" label={translate('currency')} rules={[{ required: true }]} initialValue={'USD'}>
        <Select showSearch options={currencyOptions} optionFilterProp="label" />
      </Form.Item>
      <Form.Item name="price" label={translate('price')} rules={[{ required: true }]} initialValue={0}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="discount" label={translate('discount')} initialValue={0}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="total" label={translate('Total')}>
        <InputNumber style={{ width: '100%' }} min={0} readOnly />
      </Form.Item>
      <Form.Item name="status" label={translate('status')}>
        <Select allowClear options={[{value:'New',label:'New'},{value:'Processing',label:'Processing'},{value:'Completed',label:'Completed'}]} />
      </Form.Item>
      <Form.Item name="phone" label={translate('Phone')}>
        <Input />
      </Form.Item>
      <Form.Item name="state" label={translate('state')}>
        <Input />
      </Form.Item>
      <Form.Item name="city" label={translate('city')}>
        <Input />
      </Form.Item>
      <Form.Item name="address" label={translate('Address')}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="note" label={translate('note')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );
}

