import { Form, Input, Switch, Button, message, Select, Row, Col } from 'antd';
import { useState } from 'react';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

export default function GLAccountSubGroupForm(){
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const selectedClassCode = Form.useWatch('classCode', form);
  const normalize2 = (value) => {
    const n = parseInt((value || '').toString(), 10);
    if (isNaN(n) || n < 1 || n > 99) return '';
    return n.toString().padStart(2, '0');
  };

  const handleClassChange = async (classCode) => {
    const cls = normalize2(classCode);
    form.setFieldsValue({ classCode: cls || undefined, group: undefined, groupCode: undefined, fullCode: undefined, code: undefined, subgroupcode: undefined });
    setGroupOptions([]);
    if (!cls) return;
    try {
      setLoadingGroups(true);
      const { success, result } = await request.filter({ entity: 'glaccountgroup', options: { filter: 'classCode', equal: cls } });
      if (success && Array.isArray(result)){
        const opts = result
          .map((g)=>{
            const cc = normalize2(g.classCode);
            const gc = normalize2(g.code);
            if (!cc || !gc) return null;
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

  const handleGroupChange = async (groupcode) => {
    const val = (groupcode || '').toString().replace(/\D/g,'');
    if (/^\d{4}$/.test(val)){
      const cls = val.slice(0,2);
      const grp = val.slice(2,4);
      const selectedClass = normalize2(form.getFieldValue('classCode'));
      if (selectedClass && selectedClass !== cls) {
        message.warning('Selected group does not belong to the chosen account class');
        form.setFieldsValue({ group: undefined, groupCode: undefined, fullCode: undefined, code: undefined, subgroupcode: undefined });
        return;
      }
      form.setFieldsValue({ classCode: cls, groupCode: grp });
      try {
        const { success, result } = await request.get({ entity: `glaccountsubgroup/next-code?classCode=${cls}&groupCode=${grp}` });
        if (success && result?.subCode) {
          form.setFieldsValue({ fullCode: result.subgroupcode, code: result.subCode, subgroupcode: result.subgroupcode });
        }
      } catch {}
    }
  };

  const suggestNext = async () => {
    const cls = normalize2(form.getFieldValue('classCode'));
    const grp = normalize2(form.getFieldValue('groupCode'));
    if (!cls || !grp){
      return message.warning('Select Group Code first');
    }
    try {
      const { success, result, message: msg } = await request.get({ entity: `glaccountsubgroup/next-code?classCode=${cls}&groupCode=${grp}` });
      if (!success) return message.error(msg || 'Could not suggest');
      form.setFieldsValue({ fullCode: result.subgroupcode, code: result.subCode, subgroupcode: result.subgroupcode });
    } catch { message.error('Could not suggest'); }
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
              tooltip='Only groups under the selected Account Class are shown'
              rules={[{ required: true, message: 'Group is required' }]}
            >
              <Select
                size='small'
                showSearch
                placeholder='Select group'
                options={groupOptions}
                loading={loadingGroups}
                disabled={!normalize2(selectedClassCode)}
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes((input||'').toLowerCase())}
                onChange={handleGroupChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='fullCode'
              label='Sub-Group Code'
              tooltip='6 digits: Class(2)+Group(2)+Sub(2), e.g., 010201'
              rules={[
                { required: true, message: 'Sub-Group code is required' },
                { pattern: /^\d{6}$/, message: 'Exactly 6 digits (e.g., 010201)' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !/^\d{6}$/.test((value || '').toString())) return Promise.resolve();
                    const selectedClass = (getFieldValue('classCode') || '').toString().replace(/\D/g, '').slice(0, 2);
                    const selectedGroup = (getFieldValue('groupCode') || '').toString().replace(/\D/g, '').slice(0, 2);
                    const full = (value || '').toString();
                    if (/^\d{2}$/.test(selectedClass) && full.slice(0, 2) !== selectedClass) {
                      return Promise.reject(new Error(`Sub-group must start with selected class '${selectedClass}'`));
                    }
                    if (/^\d{2}$/.test(selectedGroup) && full.slice(2, 4) !== selectedGroup) {
                      return Promise.reject(new Error(`Sub-group must match selected group '${selectedGroup}'`));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              normalize={(v)=>{
                const raw = (v || '').toString().replace(/\D/g,'').slice(0,6);
                if (raw.length === 6){
                  form.setFieldsValue({ code: raw.slice(4,6), subgroupcode: raw });
                }
                return raw;
              }}
            >
              <Input
                size='small'
                placeholder='e.g. 010201'
                maxLength={6}
                addonAfter={<Button size='small' onClick={suggestNext}>Suggest</Button>}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='name' label={translate('name')} rules={[{ required: true }]}>
              <Input size='small' placeholder='e.g. Cash and Bank' />
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
