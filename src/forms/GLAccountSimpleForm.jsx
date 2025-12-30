import { useEffect } from 'react';
import { Form, Input } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

// Minimal GL Account form for Settings: code + name
// Auto-derives classCode from the first two digits of code to satisfy backend
export default function GLAccountSimpleForm({ isUpdateForm = false }) {
  const form = Form.useFormInstance();

  // When selecting a GL account, auto-fill name if empty
  const handleSelect = async (code) => {
    form.setFieldsValue({ code });
    try {
      // best-effort: populate name from selected account if empty
      const { success, result, data } = await request.get({ entity: `postingaccount/search?search=${encodeURIComponent(code)}` });
      const list = Array.isArray(result) ? result : Array.isArray(data) ? data : [];
      const match = list.find((x) => (x.postingcode || '').toString() === (code || '').toString());
      if (match && !form.getFieldValue('name')) {
        form.setFieldsValue({ name: match.name || '' });
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      <Form.Item
        name="code"
        label="Chart of Account"
        tooltip="Select an existing Posting Account (8-digit)"
        rules={[{ required: true, message: 'Chart of Account is required' }]}
      >
        <SelectAsync
          entity={'postingaccount'}
          outputValue={'postingcode'}
          displayLabels={['postingcode', 'name']}
          placeholder={'Select posting account'}
          listOptions={{ filter: 'enabled', equal: true }}
          onChange={handleSelect}
          {...(isUpdateForm ? { value: form.getFieldValue('code'), onChange: ()=>{}, size: undefined } : {})}
        />
      </Form.Item>

      {/* Hidden auto-filled name; not editable */}
      <Form.Item name="name" style={{ display:'none' }}>
        <Input hidden />
      </Form.Item>

      {/* No extra hidden fields required */}
    </>
  );
}
