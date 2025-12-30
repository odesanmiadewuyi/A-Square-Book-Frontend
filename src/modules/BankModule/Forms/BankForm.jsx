import { Form, Input, InputNumber, Switch, Alert, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/settings/selectors';

export default function BankForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const { result: settingsResult } = useSelector(selectSettings);
  const defaultOffset = (settingsResult?.gl_settings?.gl_opening_balance_offset_postingcode || '').toString().trim();

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='code' label='Code'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='accountName' label='Account Name'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='accountNumber' label='Account Number'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='currency' label={translate('currency') || 'Currency'} initialValue={'NGN'}>
            <Input />
          </Form.Item>
        </Col>
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
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='branch' label='Branch'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='swift' label='SWIFT'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='iban' label='IBAN'>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name='openingBalance'
            label='Opening Balance'
            initialValue={0}
            tooltip='If non-zero, a balancing journal will be posted.'
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name='offsetPostingCode'
            label='Offset Posting Code'
            tooltip='Required if opening balance is non-zero (or set a default in GL Settings)'
            dependencies={['openingBalance']}
            rules={[
              {
                validator: (_, value) => {
                  const opening = parseFloat(form.getFieldValue('openingBalance')) || 0;
                  if (!opening) return Promise.resolve();
                  const hasValue = value && value.toString().trim().length > 0;
                  if (hasValue || (defaultOffset && defaultOffset.length > 0)) return Promise.resolve();
                  return Promise.reject(
                    new Error('Provide an offset posting code or configure a default in GL Settings')
                  );
                },
              },
            ]}
          >
            <SelectAsync
              entity={'postingaccount'}
              outputValue={'postingcode'}
              displayLabels={['postingcode', 'name']}
              placeholder='Select offset posting code'
            />
          </Form.Item>
        </Col>
        {!defaultOffset && (
          <Col xs={24}>
            <Alert
              type='warning'
              showIcon
              message='GL Settings default offset posting code is not set. If Opening Balance is non-zero, you must select an Offset Posting Code here.'
              style={{ marginBottom: 12 }}
            />
          </Col>
        )}
        <Col xs={24} md={12}>
          <Form.Item name='enabled' label={translate('Enabled')} valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
