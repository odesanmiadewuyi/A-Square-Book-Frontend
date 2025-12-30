import { Form, Input, Switch, Button, message, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useSelector } from 'react-redux';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { request } from '@/request';

const CLASS_OPTIONS = [
  { value: '1', label: '1 - Assets' },
  { value: '2', label: '2 - Liabilities' },
  { value: '3', label: '3 - Equity' },
  { value: '4', label: '4 - Income' },
  { value: '5', label: '5 - Expenses' },
];

export default function GLAccountForm(){
  const translate = useLanguage();
  const { money_format_settings = {} } = useSelector(selectFinanceSettings);
  const defaultCurrency = money_format_settings?.default_currency_code || 'NGN';
  const form = Form.useFormInstance();

  const handleClassChange = async (val) => {
    const classCode = (val || '').toString();
    const parent = (form.getFieldValue('parentCode') || '').toString();
    // Auto-suggest a 4-digit code upon class selection (e.g., 01 -> 0100)
    try {
      const params = new URLSearchParams({ classCode, totalLength: '4' });
      if (parent) params.append('parentCode', parent);
      const { success, result } = await request.get({ entity: `glaccount/next-code?${params}` });
      if (success && result?.nextCode) {
        form.setFieldsValue({ code: result.nextCode });
      } else {
        // Fallback to base prefix if API not ready
        const prefix = (parent || classCode).replace(/\s+/g, '');
        const rem = Math.max(0, 4 - prefix.length);
        form.setFieldsValue({ code: `${prefix}${'0'.repeat(rem)}` });
      }
    } catch {
      const prefix = (parent || classCode).replace(/\s+/g, '');
      const rem = Math.max(0, 4 - prefix.length);
      form.setFieldsValue({ code: `${prefix}${'0'.repeat(rem)}` });
    }
  };

  const suggestNextCode = async () => {
    try {
      const cls = (form.getFieldValue('classCode') || '').toString();
      if (!cls) {
        message.warning('Please select a Class first');
        return;
      }
      const parent = (form.getFieldValue('parentCode') || '').toString();
      const params = new URLSearchParams({ classCode: cls, totalLength: '4' });
      if (parent) params.append('parentCode', parent);
      const { success, result, message: msg } = await request.get({ entity: `glaccount/next-code?${params}` });
      if (!success) {
        message.error(msg || 'Could not suggest next code');
        return;
      }
      form.setFieldsValue({ code: result.nextCode });
      message.success(`Suggested ${result.nextCode}`);
    } catch (e) {
      message.error('Could not suggest next code');
    }
  };
  return (
    <>
      <div style={{ background: '#fbfcfe', border: '1px solid #eef2f7', padding: 16, borderRadius: 10 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item
              name='classCode'
              label='Class (1-5)'
              tooltip='1-Assets, 2-Liabilities, 3-Equity, 4-Income, 5-Expenses'
              rules={[{ required: true, message: 'Class is required' }]}
            >
              <SelectAsync
                size='small'
                entity={'glaccountclass'}
                outputValue={'code'}
                displayLabels={['code','name']}
                placeholder='Select class'
                onChange={handleClassChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='code'
              label='Code'
              tooltip='4-digit scheme with 2-digit class prefix (e.g., 01xx Assets). Example: 0100 Cash & Bank.'
              dependencies={['classCode','parentCode']}
              rules={[
                { required: true, message: 'GL code is required' },
                { pattern: /^\d{3,10}$/, message: '3-10 digits (e.g. 0100, 010101)' },
                ({ getFieldValue }) => ({
                  validator(_, value){
                    const rawCls = (getFieldValue('classCode') || '').toString();
                    if (!value || !rawCls) return Promise.resolve();
                    const clsNum = parseInt(rawCls, 10);
                    const cls = isNaN(clsNum) ? rawCls : clsNum.toString().padStart(2,'0');
                    const str = (value || '').toString();
                    if (!str.startsWith(cls)) {
                      return Promise.reject(new Error(`Code must start with class '${cls}'`));
                    }
                    const parent = (getFieldValue('parentCode') || '').toString();
                    if (parent) {
                      if (!str.startsWith(parent)) {
                        return Promise.reject(new Error('Code must start with parent code'));
                      }
                      if (str.length <= parent.length) {
                        return Promise.reject(new Error('Code must be longer than parent code'));
                      }
                    }
                    return Promise.resolve();
                  }
                })
              ]}
              normalize={(v)=> (v || '').replace(/\s+/g,'')}
            >
              <Input
                size='small'
                placeholder='e.g. 0100'
                maxLength={10}
                addonAfter={<Button size='small' onClick={suggestNextCode}>Suggest</Button>}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
              <Input size='small' />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='parentCode'
              label='Parent Code'
              tooltip='If this account is a child, provide the parent account code'
              normalize={(v)=> (v || '').replace(/\s+/g,'')}
            >
              <Input size='small' placeholder='optional parent code' />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='currency' label='Currency' initialValue={defaultCurrency} rules={[{ required: true }]}>
              <Input size='small' placeholder={defaultCurrency} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={[12, 0]}>
              <Col xs={12}>
                <Form.Item name='isControl' label='Control Account' valuePropName='checked'>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name='active' label='Active' valuePropName='checked' initialValue={true}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
}
