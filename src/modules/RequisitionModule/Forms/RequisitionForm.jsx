import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, Divider, Typography } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

export function RequisitionCreateForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>{translate('Requester') || 'Requester'}</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='requester' label={translate('Requester')} rules={[{ required: true }]}> 
            <SelectAsync entity={'staff'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('Select Staff') || 'Select Staff'} onChange={async (staffId)=>{
              try {
                if (!staffId) { try { form.setFieldsValue({ department: undefined }); } catch{}; return; }
                const { success, result } = await request.read({ entity:'staff', id: staffId });
                if (success && result) {
                  const depId = result?.department?._id || result?.department;
                  try { form.setFieldsValue({ department: depId || undefined }); } catch{}
                }
              } catch(e) {}
            }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='department' label={translate('Department')} rules={[{ required: true }]}> 
            <SelectAsync
              entity={'department'}
              outputValue={'_id'}
              displayLabels={['name']}
              placeholder={translate('Select Department') || 'Select Department'}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name='description' label={translate('Description of work')}> 
        <Input.TextArea rows={3} />
      </Form.Item>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='estAmount' label={translate('Estimated Amount')} rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='status' label={translate('Status')} initialValue={'Draft'}>
            <Select options={['Draft','Submitted','Approved','Rejected'].map(v=>({ value:v, label:v }))} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export function RequisitionUpdateForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  useEffect(()=>{},[]);
  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>{translate('PR No') || 'PR No'}</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='prNo' label={translate('PR No')}>
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Typography.Title level={5}>{translate('Requester') || 'Requester'}</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='requester' label={translate('Requester')} rules={[{ required: true }]}> 
            <SelectAsync entity={'staff'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('Select Staff') || 'Select Staff'} onChange={async (staffId)=>{
              try {
                if (!staffId) { try { form.setFieldsValue({ department: undefined }); } catch{}; return; }
                const { success, result } = await request.read({ entity:'staff', id: staffId });
                if (success && result) {
                  const depId = result?.department?._id || result?.department;
                  try { form.setFieldsValue({ department: depId || undefined }); } catch{}
                }
              } catch(e) {}
            }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='department' label={translate('Department')} rules={[{ required: true }]}> 
            <SelectAsync
              entity={'department'}
              outputValue={'_id'}
              displayLabels={['name']}
              placeholder={translate('Select Department') || 'Select Department'}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name='description' label={translate('Description of work')}> 
        <Input.TextArea rows={3} />
      </Form.Item>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='estAmount' label={translate('Estimated Amount')} rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='status' label={translate('Status')}>
            <Select options={['Draft','Submitted','Approved','Rejected'].map(v=>({ value:v, label:v }))} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
