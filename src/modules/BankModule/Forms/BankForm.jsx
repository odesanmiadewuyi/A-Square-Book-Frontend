import { Form, Input, Switch, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useEffect } from 'react';
import './BankForm.css';

export default function BankForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const accountNameValue = Form.useWatch('accountName', form);
  const postingAccountCodeValue = Form.useWatch('postingAccountCode', form);
  const bankPostingListOptions = {
    // Bank posting accounts are under Assets(03) -> Cash and Bank(01)
    filter: 'classCode',
    equal: '03',
    inFilter: 'groupCode',
    inEqual: '01,1',
    sortBy: 'postingcode',
    sortValue: 1,
    items: 200,
  };

  const buildGeneratedCode = () => {
    const posting = (postingAccountCodeValue || '').toString().trim().replace(/\s+/g, '');
    if (posting) return `BK-${posting.toUpperCase()}`;
    return '';
  };

  useEffect(() => {
    const generatedCode = buildGeneratedCode();
    const accountName = (accountNameValue || '').toString().trim();
    const generatedName = accountName || (generatedCode ? `Bank ${generatedCode}` : '');
    const patch = {};
    if ((form.getFieldValue('code') || '') !== generatedCode) patch.code = generatedCode || undefined;
    if ((form.getFieldValue('name') || '') !== generatedName) patch.name = generatedName || undefined;
    if (Object.keys(patch).length > 0) form.setFieldsValue(patch);
  }, [accountNameValue, postingAccountCodeValue]);

  return (
    <div className='bank-form-compact'>
      <Row gutter={[12, 8]}>
        <Col xs={24} md={12}>
          <Form.Item
            name='postingAccountCode'
            label='Posting Code'
            rules={[{ required: true, message: 'Posting code is required' }]}
          >
            <SelectAsync
              entity={'postingaccount'}
              outputValue={'postingcode'}
              displayLabels={['postingcode', 'name']}
              placeholder='Select posting code'
              size='small'
              listOptions={bankPostingListOptions}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='accountName' label='Account Name' rules={[{ required: true, message: 'Account Name is required' }]}>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='code' label='Code' tooltip='Auto-generated from Posting Code'>
            <Input size='small' readOnly placeholder='Auto-generated' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='accountNumber' label='Account Number'>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='currency' label={translate('currency') || 'Currency'} initialValue={'NGN'}>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='branch' label='Branch'>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='swift' label='SWIFT'>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='iban' label='IBAN'>
            <Input size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='enabled' label={translate('Enabled')} valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name='name' style={{ display: 'none' }} rules={[{ required: true }]}>
        <Input hidden />
      </Form.Item>
    </div>
  );
}
