import { Form, Input, Switch, Button, message, Select, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useState, useEffect } from 'react';

export default function PostingAccountForm(){
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [subGroupOptions, setSubGroupOptions] = useState([]);
  const [loadingSubGroups, setLoadingSubGroups] = useState(false);

  // Ensure backend indexes are healthy (idempotent)
  useEffect(() => {
    (async ()=>{
      try { await request.post({ entity: 'postingaccount/repair-indexes' }); } catch(e) { /* silent */ }
    })();
  }, []);

  const handleClassChange = async (classCode) => {
    const cls = (classCode || '').toString().replace(/\D/g,'').slice(0,2);
    form.setFieldsValue({ classCode: cls || undefined, group: undefined, groupCode: undefined, fullCode: undefined, code: undefined, subgroupcode: undefined });
    setGroupOptions([]);
    setSubGroupOptions([]);
    if (!/^\d{2}$/.test(cls)) return;
    try {
      setLoadingGroups(true);
      const { success, result } = await request.filter({ entity: 'glaccountgroup', options: { filter: 'classCode', equal: cls } });
      if (success && Array.isArray(result)){
        const opts = result
          .map((g)=>{
            const cc = (g.classCode || '').toString().padStart(2,'0');
            const gc = (g.code || '').toString().padStart(2,'0');
            const combined = (g.groupcode && /^\d{4}$/.test((g.groupcode||'').toString())) ? (g.groupcode||'').toString() : `${cc}${gc}`;
            if (!/^\d{4}$/.test(combined)) return null;
            return { value: combined, label: `${combined} ${g.name || ''}`.trim() };
          })
          .filter(Boolean)
          .sort((a,b)=> a.value.localeCompare(b.value));
        setGroupOptions(opts);
      }
    } finally { setLoadingGroups(false); }
  };

  const loadSubGroups = async (cls, grp) => {
    setLoadingSubGroups(true);
    try {
      const { success, result } = await request.filter({ entity: 'glaccountsubgroup', options: { filter: 'classCode', equal: cls } });
      if (success && Array.isArray(result)){
        const opts = result
          .filter((r)=> (r.groupCode||'').toString().padStart(2,'0') === grp)
          .map((r)=>{
            const cc = (r.classCode||'').toString().padStart(2,'0');
            const gc = (r.groupCode||'').toString().padStart(2,'0');
            const sc = (r.code||'').toString().padStart(2,'0');
            const combined = `${cc}${gc}${sc}`;
            return { value: combined, label: `${combined} ${r.name || ''}`.trim() };
          })
          .sort((a,b)=> a.value.localeCompare(b.value));
        setSubGroupOptions(opts);
      } else {
        setSubGroupOptions([]);
      }
    } finally { setLoadingSubGroups(false); }
  };

  const handleGroupChange = async (groupcode) => {
    const val = (groupcode || '').toString().replace(/\D/g,'');
    if (/^\d{4}$/.test(val)){
      const cls = val.slice(0,2);
      const grp = val.slice(2,4);
      form.setFieldsValue({ classCode: cls, groupCode: grp, fullCode: undefined, code: undefined, subgroupcode: undefined });
      await loadSubGroups(cls, grp);
    }
  };

  const suggestNext = async () => {
    const cls = (form.getFieldValue('classCode') || '').toString();
    const grp = (form.getFieldValue('groupCode') || '').toString();
    if (!/^\d{2}$/.test(cls) || !/^\d{2}$/.test(grp)){
      return message.warning('Select Group Code first');
    }
    try {
      const { success, result, message: msg } = await request.get({ entity: `postingaccount/next-code?classCode=${cls}&groupCode=${grp}` });
      if (!success) return message.error(msg || 'Could not suggest');
      form.setFieldsValue({ fullCode: result.subgroupcode, code: result.subCode, subgroupcode: result.subgroupcode });
    } catch { message.error('Could not suggest'); }
  };

  const handleSubGroupChange = async (subgroupcode) => {
    const raw = (subgroupcode || '').toString().replace(/\D/g,'');
    if (/^\d{6}$/.test(raw)){
      form.setFieldsValue({
        fullCode: raw,
        subgroupcode: raw,
        classCode: raw.slice(0,2),
        groupCode: raw.slice(2,4),
        code: raw.slice(4,6),
      });
      try {
        const cls = raw.slice(0,2);
        const grp = raw.slice(2,4);
        const sub = raw.slice(4,6);
        const { success, result } = await request.get({ entity: `postingaccount/next-posting?classCode=${cls}&groupCode=${grp}&subCode=${sub}` });
        if (success && result?.postingcode) {
          form.setFieldsValue({ postingcode: result.postingcode });
        }
      } catch {}
    }
  };

  return (
    <>
      <div style={{ background: '#fbfcfe', border: '1px solid #eef2f7', padding: 16, borderRadius: 10 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item
              name='class'
              label='Account Class'
              tooltip='Select the account class (e.g., 01 Assets)'
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
              name='group'
              label='Group Code'
              tooltip='Select an existing Group (4-digit) for the chosen class'
              rules={[{ required: true, message: 'Group is required' }]}
            >
              <Select
                size='small'
                showSearch
                placeholder='Select group'
                options={groupOptions}
                loading={loadingGroups}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes((input||'').toLowerCase())}
                onChange={handleGroupChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='fullCode'
              label='Sub-Group Code'
              tooltip='Pick an existing Sub-Group under the selected Class/Group'
              rules={[{ required: true, message: 'Sub-Group code is required' }]}
            >
              <Select
                size='small'
                showSearch
                placeholder='Select sub-group'
                options={subGroupOptions}
                loading={loadingSubGroups}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes((input||'').toLowerCase())}
                onChange={handleSubGroupChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='postingcode' label='Posting Code' rules={[{ required: true, message: 'Posting code is required' }, { pattern: /^\d{8}$/, message: 'Auto format: 8 digits (SSGGSSPP)' }]}>
              <Input size='small' placeholder='Auto: subgroup + 2-digit' maxLength={12} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
              <Input size='small' placeholder='e.g. Cash and Bank Posting' />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='enabled' label='Enabled' valuePropName='checked' initialValue={true}>
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name='description' label={translate('description')}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* hidden fields for backend */}
      <Form.Item name='classCode' style={{ display:'none' }} rules={[{ required: true }]}>
        <Input hidden />
      </Form.Item>
      <Form.Item name='groupCode' style={{ display:'none' }} rules={[{ required: true }]}>
        <Input hidden />
      </Form.Item>
      <Form.Item name='code' style={{ display:'none' }} rules={[{ required: true }]}>
        <Input hidden />
      </Form.Item>
      <Form.Item name='subgroupcode' style={{ display:'none' }}>
        <Input hidden />
      </Form.Item>
    </>
  );
}
