import { Form, Input, InputNumber, Select, Row, Col } from 'antd';
import React, { useMemo, useState } from 'react';
import SelectAsync from '@/components/SelectAsync';
import currencyFlag from '@/utils/currencyList';
import useLanguage from '@/locale/useLanguage';

export default function ExpenseForm() {
  const translate = useLanguage();
  const [currency, setCurrency] = useState('USD');

  const currencyOptions = useMemo(
    () =>
      currencyFlag.map((c) => ({
        value: c.currency_code,
        label: `${c.flag} ${c.currency_code}`,
      })),
    []
  );

  return (
    <>
      <div style={{ background: '#fbfcfe', border: '1px solid #eef2f7', padding: 16, borderRadius: 10 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label={translate('name')} rules={[{ required: true }]}>
              <Input size="small" placeholder={translate('name')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="category" label={translate('expenses_category')} rules={[{ required: true }]}>
              <SelectAsync
                size="small"
                entity={'expensecategory'}
                outputValue={'_id'}
                displayLabels={['name']}
                placeholder={translate('expenses_category')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="currency" label={translate('currency')} initialValue={currency} rules={[{ required: true }]}>
              <Select
                size="small"
                showSearch
                options={currencyOptions}
                optionFilterProp="label"
                onChange={(val) => setCurrency(val)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="total" label={translate('Total')} rules={[{ required: true }]} initialValue={0}>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                min={0}
                addonBefore={currency}
                placeholder={translate('Total')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="ref" label={'Ref'}>
              <Input size="small" placeholder="e.g. INV-12345 or internal note" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="description" label={translate('description')}>
              <Input.TextArea rows={2} placeholder={translate('description')} />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </>
  );
}
