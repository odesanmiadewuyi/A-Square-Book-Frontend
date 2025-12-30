import { Form, Input, Switch } from 'antd';
import { useEffect } from 'react';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

export default function GLAccountClassForm(){
  const translate = useLanguage();
  const form = Form.useFormInstance();

  useEffect(() => {
    let mounted = true;
    async function loadNextCode() {
      try {
        // Avoid overriding on update forms where code already exists
        const existing = form?.getFieldValue?.('code');
        if (existing) return;
        const data = await request.get({ entity: 'glaccountclass/next-code' });
        if (mounted && data?.success && data?.result?.nextCode) {
          form.setFieldsValue({ code: data.result.nextCode });
        }
      } catch (e) {
        // silent fail; user can still type if needed
      }
    }
    if (form) loadNextCode();
    return () => {
      mounted = false;
    };
  }, [form]);
  return (
    <>
      <Form.Item
        name='code'
        label='Code'
        tooltip='Auto-generated (01, 02, ...).'
        rules={[{ required: true, message: 'Code is required' }]}
        normalize={(v)=> (v||'').trim()}
      >
        <Input placeholder='Auto' maxLength={2} disabled readOnly />
      </Form.Item>
      <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
        <Input placeholder='e.g. Assets' />
      </Form.Item>
      <Form.Item name='description' label={translate('description')}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name='enabled' label='Enabled' valuePropName='checked' initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}
