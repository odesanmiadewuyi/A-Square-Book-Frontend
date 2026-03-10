import { Form, Input, Switch, Button, message } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

export default function GLAccountGroupForm(){
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const pad2 = (v) => {
    const n = parseInt((v || '').toString(), 10);
    if (isNaN(n) || n < 1 || n > 99) return '';
    return n.toString().padStart(2, '0');
  };

  const handleClassChange = async (val) => {
    const classCode = pad2(val);
    form.setFieldsValue({ classCode: classCode || undefined });
    if (!classCode) {
      form.setFieldsValue({ code: undefined, fullCode: undefined, groupcode: undefined });
      return;
    }
    try {
      const { success, result } = await request.get({ entity: `glaccountgroup/next-code?classCode=${classCode}` });
      if (success && result?.nextCode) {
        const fullCode = `${classCode}${result.nextCode}`;
        form.setFieldsValue({ code: result.nextCode, fullCode, groupcode: fullCode });
      }
    } catch {
      // silent
    }
  };

  const suggestNext = async () => {
    const cls = pad2(form.getFieldValue('classCode'));
    if (!cls) {
      message.warning('Please select a Class first');
      return;
    }
    form.setFieldsValue({ classCode: cls });
    try {
      const { success, result, message: msg } = await request.get({ entity: `glaccountgroup/next-code?classCode=${cls}` });
      if (!success) return message.error(msg || 'Could not suggest');
      const fullCode = `${cls}${result.nextCode}`;
      form.setFieldsValue({ classCode: cls, code: result.nextCode, fullCode, groupcode: fullCode });
      message.success(`Suggested ${fullCode}`);
    } catch {
      message.error('Could not suggest');
    }
  };

  return (
    <>
      <Form.Item
        name='classCode'
        label='Account Class'
        tooltip='Select the top-level class (e.g., 01 Assets)'
        rules={[{ required: true, message: 'Class is required' }]}
      >
        <SelectAsync
          entity={'glaccountclass'}
          outputValue={'code'}
          displayLabels={['code','name']}
          placeholder='Select class'
          onChange={handleClassChange}
        />
      </Form.Item>

      <Form.Item
        name='fullCode'
        label='Full Group Code'
        tooltip='Type or paste 4 digits: Class(2)+Group(2), e.g., 0103'
        rules={[
          { required: true, message: 'Full code is required' },
          { pattern: /^\d{4}$/, message: 'Exactly 4 digits (e.g., 0103)' },
          () => ({
            async validator(){
              const full = (form.getFieldValue('fullCode') || '').toString();
              if (!/^\d{4}$/.test(full)) return Promise.resolve();
              try {
                const { success, result } = await request.filter({
                  entity: 'glaccountgroup',
                  options: { filter: 'groupcode', equal: full },
                });
                if (success && Array.isArray(result) && result.length > 0) {
                  return Promise.reject(new Error(`Group '${full}' already exists`));
                }
                return Promise.resolve();
              } catch {
                return Promise.resolve();
              }
            }
          })
        ]}
        normalize={(v)=>{
          const raw = (v || '').toString().replace(/\D/g,'').slice(0,4);
          if (raw.length >= 2) form.setFieldsValue({ classCode: raw.slice(0,2) });
          if (raw.length === 4) form.setFieldsValue({ code: raw.slice(2,4), groupcode: raw });
          return raw;
        }}
      >
        <Input placeholder='e.g. 0103' maxLength={4} addonAfter={<Button size='small' onClick={suggestNext}>Suggest</Button>} />
      </Form.Item>

      {/* Hidden field actually sent to backend */}
      <Form.Item name='code' style={{ display: 'none' }} rules={[{ required: true }]}>
        <Input hidden />
      </Form.Item>
      <Form.Item name='groupcode' style={{ display: 'none' }}>
        <Input hidden />
      </Form.Item>

      <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
        <Input placeholder='e.g. Current Assets' />
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

