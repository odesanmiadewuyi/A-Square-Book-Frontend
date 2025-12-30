import React from 'react';
import { Form, Input, Switch, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useEffect, useState } from 'react';
import { request } from '@/request';

export default function StaffForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async (deptId) => {
    if (!deptId) {
      setRoleOptions([]);
      try { form.setFieldsValue({ title: undefined, roleTitle: undefined }); } catch {}
      return;
    }
    setLoading(true);
    try {
      const resp = await request.list({ entity: 'roletitle', options: { filter: 'department', equal: deptId, items: 100 } });
      const arr = Array.isArray(resp?.result) ? resp.result : Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      setRoleOptions(arr.map((r) => ({ value: r._id, label: r.name })));
    } catch (e) {
      setRoleOptions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const dep = form.getFieldValue('department');
      if (dep) fetchRoles(dep);
    } catch {}
  }, []);
  return (
    <>
      <Form.Item name='name' label={translate('Full Name')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name='email' label={translate('Email')} rules={[{ type: 'email', message: translate('Please enter a valid email address') || 'Please enter a valid email address' }]}>
        <Input type='email' />
      </Form.Item>
      <Form.Item name='phone' label={translate('Phone')}>
        <Input />
      </Form.Item>
      <Form.Item name='department' label={translate('Department')} rules={[{ required: true, message: translate('Department is required') || 'Department is required' }]}>
        <SelectAsync
          entity={'department'}
          outputValue={'_id'}
          displayLabels={['name']}
          placeholder={translate('Select Department') || 'Select Department'}
          onChange={(v)=> fetchRoles(v)}
        />
      </Form.Item>
      <Form.Item name='roleTitle' label={translate('Title/Role')}>
        <Select
          options={roleOptions}
          loading={loading}
          placeholder={translate('Select Role/Title') || 'Select Role/Title'}
          allowClear
          onChange={(val, opt)=>{
            // store text label into denormalized 'title' field as well
            try { form.setFieldsValue({ title: opt?.label || '' }); } catch{}
          }}
        />
      </Form.Item>
      <Form.Item name='title' style={{ display:'none' }}>
        <Input hidden />
      </Form.Item>
      <Form.Item name='active' label={translate('Active')} valuePropName='checked' initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}
