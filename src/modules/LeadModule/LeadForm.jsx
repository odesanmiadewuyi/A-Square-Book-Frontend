import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, message } from 'antd';

import { COUNTRY_OPTIONS } from '@/constants/countries';
import useLanguage from '@/locale/useLanguage';
import { leadService } from '@/request/leadService';

const BRANCH_OPTIONS = [
  { label: 'Main', value: 'Main' },
  { label: 'East', value: 'East' },
  { label: 'West', value: 'West' },
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
];

const TYPE_OPTIONS = [
  { label: 'People', value: 'People' },
  { label: 'Company', value: 'Company' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'In Negotiation', value: 'In Negotiation' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
  { label: 'Canceled', value: 'Canceled' },
  { label: 'On Hold', value: 'On Hold' },
];

const SOURCE_OPTIONS = [
  { label: 'Sales', value: 'Sales' },
  { label: 'Advertising', value: 'Advertising' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Website', value: 'Website' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Other', value: 'Other' },
];

const LeadForm = ({ lead, onSuccess, onCancel }) => {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const countryOptions = useMemo(
    () => COUNTRY_OPTIONS.map((country) => ({ label: country, value: country })),
    []
  );

  useEffect(() => {
    if (lead) {
      form.setFieldsValue({
        branch: lead.branch || undefined,
        type: lead.type || undefined,
        name: lead.name || '',
        status: lead.status || undefined,
        source: lead.source || undefined,
        country: lead.country || undefined,
        phone: lead.phone || '',
        email: lead.email || '',
        project: lead.project || '',
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({ type: 'People', status: 'New' });
  }, [lead, form]);

  const sanitizePayload = (values) =>
    Object.entries(values).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim();
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});

  const handleSubmit = async (values) => {
    setLoading(true);
    const payload = sanitizePayload(values);
    // Ensure name exists; fall back to the email local part for convenience
    if (!payload.name || payload.name.length === 0) {
      if (typeof payload.email === 'string' && payload.email.includes('@')) {
        payload.name = payload.email.split('@')[0];
      }
    }

    try {
      const response = lead
        ? await leadService.updateLead(lead._id, payload)
        : await leadService.createLead(payload);

      message.success(
        response?.message || (lead ? 'Lead updated successfully' : 'Lead created successfully')
      );

      if (!lead) {
        form.resetFields();
        form.setFieldsValue({ type: 'People', status: 'New' });
      }

      onSuccess?.(response?.data);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        message.error(validationErrors.join('; '));
      } else {
        message.error(apiMessage || 'Unable to save lead. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Card title={lead ? translate('edit') + ' ' + translate('lead') : translate('add_new_lead')} bordered={false}>
      <Form layout="vertical" form={form} onFinish={handleSubmit} disabled={loading}>
        <Form.Item label={translate('branch')} name="branch">
          <Select allowClear placeholder={translate('branch')} options={BRANCH_OPTIONS} />
        </Form.Item>

        <Form.Item
          label={translate('type')}
          name="type"
          rules={[{ required: true, message: translate('type') + ' is required' }]}
        >
          <Select placeholder={translate('type')} options={TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          label={translate('name')}
          name="name"
          rules={[{ required: true, message: translate('name') + ' is required' }]}
        >
          <Input placeholder={translate('name')} />
        </Form.Item>

        <Form.Item label={translate('status')} name="status">
          <Select allowClear placeholder={translate('status')} options={STATUS_OPTIONS} />
        </Form.Item>

        <Form.Item label={translate('source')} name="source">
          <Select allowClear showSearch placeholder={translate('source')} options={SOURCE_OPTIONS} />
        </Form.Item>

        <Form.Item label={translate('country')} name="country">
          <Select
            allowClear
            showSearch
            placeholder={translate('country')}
            options={countryOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
            }
          />
        </Form.Item>

        <Form.Item label={translate('phone')} name="phone">
          <Input placeholder="+1 123 456 789" />
        </Form.Item>

        <Form.Item
          label={translate('email')}
          name="email"
          rules={[
            { required: true, message: translate('email') + ' is required' },
            { type: 'email', message: translate('enter_valid_email') || 'Please enter a valid email address' },
          ]}
        >
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>

        <Form.Item label={translate('project')} name="project">
          <Input.TextArea rows={3} placeholder={translate('project')} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {lead ? translate('edit') : translate('submit')}
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              {translate('cancel')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LeadForm;
