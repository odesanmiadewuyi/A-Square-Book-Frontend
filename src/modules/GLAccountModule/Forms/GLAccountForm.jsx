import { Form, Input, Switch, Button, message, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useSelector } from 'react-redux';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { request } from '@/request';

export default function GLAccountForm(){
  const translate = useLanguage();
  const { money_format_settings = {} } = useSelector(selectFinanceSettings);
  const defaultCurrency = money_format_settings?.default_currency_code || 'NGN';
  const form = Form.useFormInstance();

  const normalize2 = (value) => {
    const n = parseInt((value || '').toString(), 10);
    if (isNaN(n) || n < 1 || n > 99) return '';
    return n.toString().padStart(2, '0');
  };

  const suggestCode = async ({ classCode, parentCode }) => {
    const cls = normalize2(classCode);
    const parent = (parentCode || '').toString().replace(/\D/g, '');
    if (!cls) return { success: false, message: 'Class code must be 1-2 digits' };

    const prefix = parent || cls;
    const startLen = Math.min(10, Math.max(4, prefix.length + 1));
    for (let length = startLen; length <= 10; length += 1) {
      const params = new URLSearchParams({ classCode: cls, totalLength: String(length) });
      if (parent) params.append('parentCode', parent);
      const resp = await request.get({ entity: `glaccount/next-code?${params}` });
      if (resp?.success && resp?.result?.nextCode) return resp;
      const exhausted = /range exhausted/i.test((resp?.message || '').toString());
      if (!exhausted) return resp;
    }
    return { success: false, message: 'No available account code left for this prefix' };
  };

  const handleClassChange = async (val) => {
    const classCode = normalize2(val);
    const parent = (form.getFieldValue('parentCode') || '').toString();
    form.setFieldsValue({ classCode: classCode || undefined });
    if (!classCode) {
      form.setFieldsValue({ code: undefined });
      return;
    }
    // Auto-suggest the next available code, expanding length when shorter ranges are exhausted.
    try {
      const resp = await suggestCode({ classCode, parentCode: parent });
      if (resp?.success && resp?.result?.nextCode) form.setFieldsValue({ code: resp.result.nextCode });
      else form.setFieldsValue({ code: undefined });
    } catch {
      form.setFieldsValue({ code: undefined });
    }
  };

  const suggestNextCode = async () => {
    try {
      const cls = normalize2(form.getFieldValue('classCode'));
      if (!cls) {
        message.warning('Please select a Class first');
        return;
      }
      const parent = (form.getFieldValue('parentCode') || '').toString();
      const resp = await suggestCode({ classCode: cls, parentCode: parent });
      if (!resp?.success || !resp?.result?.nextCode) {
        message.error(resp?.message || 'Could not suggest next code');
        return;
      }
      form.setFieldsValue({ classCode: cls, code: resp.result.nextCode });
      message.success(`Suggested ${resp.result.nextCode}`);
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
