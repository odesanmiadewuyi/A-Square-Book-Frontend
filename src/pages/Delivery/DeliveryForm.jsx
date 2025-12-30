import React, { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Row, Col, Divider, Typography } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { request } from '@/request';

export default function DeliveryForm() {
  const translate = useLanguage();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const form = Form.useFormInstance();
  useEffect(()=>{
    try {
      const name = currentAdmin?.name || currentAdmin?.email || '';
      if (name) form.setFieldsValue({ approvedBy: name });
    } catch {}
  }, [currentAdmin]);
  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>{translate('Delivery') || 'Delivery'}</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={8}>
          <Form.Item name='referenceNo' label={translate('Reference No') || 'Reference No'}>
            <Input readOnly disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name='kind' label={translate('Type')} initialValue={'GRN'}>
            <Select options={[{value:'GRN', label:'GRN'},{value:'SERVICE_CERT', label:'Service Certificate'}]} />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item name='joId' label={translate('Reference PO/LOA/JO')} rules={[{ required: true }]}> 
            <SelectAsync
              entity={'joborder'}
              outputValue={'_id'}
              displayLabels={['joNo']}
              placeholder={translate('Select Job Order') || 'Select Job Order'}
              listOptions={{ inFilter: 'status', inEqual: 'Completed,Closed', excludeApprovedDelivery: 1, items: 50 }}
              onChange={async (joId)=>{
                try {
                  if (!joId) { form.setFieldsValue({ vendorId: undefined }); return; }
                  const { success, result } = await request.read({ entity:'joborder', id: joId });
                  if (success && result) {
                    const vId = result?.vendorId?._id || result?.vendorId;
                    if (vId) form.setFieldsValue({ vendorId: vId });
                  }
                } catch {}
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ margin: '8px 0 16px' }} />
      <Typography.Title level={5}>{translate('Vendor') || 'Vendor'}</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='vendorId' label={translate('Vendor')} rules={[{ required: true }]}>
            <SelectAsync entity={'vendor'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('Select Vendor') || 'Select Vendor'} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='deliveredAt' label={translate('Date')}>
            <DatePicker style={{ width:'100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='description' label={translate('Items/Services')} rules={[{ required: true }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name='note' label={translate('Description')}>
        <Input.TextArea rows={2} />
      </Form.Item>

      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Form.Item name='deliveredQty' label={translate('Quantity')}>
            <InputNumber style={{ width:'100%' }} min={0} step={0.01} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='location' label={translate('Location')}>
            <SelectAsync entity={'department'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('Select Department') || 'Select Department'} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name='approvedBy' label={translate('Accepted by (name)')}>
        <Input readOnly disabled />
      </Form.Item>
    </>
  );
}
