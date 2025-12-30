import { Form, Input, InputNumber, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import currencyList from '@/utils/currencyList';

export default function ProductForm() {
  const translate = useLanguage();
  const currencyOptions = currencyList.map((c) => ({ label: `${c.flag} ${c.currency_code}`, value: c.currency_code }));

  return (
    <>
      <Form.Item name="name" label={translate('name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="category" label={translate('product_category')} rules={[{ required: false }]}> 
        <SelectAsync entity={'productcategory'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('product_category')} />
      </Form.Item>

      <Form.Item name="currency" label={translate('currency')} initialValue={'USD'} rules={[{ required: true }]}>
        <Select showSearch options={currencyOptions} optionFilterProp="label" />
      </Form.Item>

      <Form.Item name="price" label={translate('price')} rules={[{ required: true }]} initialValue={0}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item name="description" label={translate('description')}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item name="image" label={translate('image')}>
        <Input placeholder="https://..." />
      </Form.Item>
    </>
  );
}

