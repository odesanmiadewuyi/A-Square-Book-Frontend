import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, message } from 'antd';

import { COUNTRY_OPTIONS } from '@/constants/countries';
import useLanguage from '@/locale/useLanguage';
import { companyService } from '@/request/companyService';
import { personService } from '@/request/personService';

const CompanyForm = ({ company, onSuccess, onCancel }) => {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const searchTimeout = useRef(null);

  const countryOptions = useMemo(
    () => COUNTRY_OPTIONS.map((country) => ({ label: country, value: country })),
    []
  );

  const fetchContacts = async (search = '') => {
    setContactsLoading(true);
    try {
      const response = await personService.getPeople({ limit: 50, search });
      if (response?.success) {
        const options = (response.data || []).map((person) => ({
          label: `${person.firstname || ''} ${person.lastname || ''}`.trim(),
          value: person._id,
        }));
        setContacts(options);
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || 'Unable to fetch contacts.');
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (company) {
      form.setFieldsValue({
        name: company.name || '',
        contact: company.contact?._id,
        country: company.country || undefined,
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
      });
      return;
    }

    form.resetFields();
  }, [company, form]);

  const handleSearchContact = (value) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchContacts(value.trim());
    }, 400);
  };

  const sanitizePayload = (values) =>
    Object.entries(values).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim();
        return acc;
      }

      if (key === 'contact' && !value) {
        acc[key] = null;
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});

  const handleSubmit = async (values) => {
    setLoading(true);
    const payload = sanitizePayload(values);

    try {
      const response = company
        ? await companyService.updateCompany(company._id, payload)
        : await companyService.createCompany(payload);

      message.success(response?.message || (company ? 'Company updated successfully' : 'Company created successfully'));

      if (!company) {
        form.resetFields();
      }

      onSuccess?.(response?.data);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        message.error(validationErrors.join('; '));
      } else {
        message.error(apiMessage || 'Unable to save company. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Card
      title={company ? `${translate('edit')} ${translate('company')}` : translate('add_new_company')}
      bordered={false}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} disabled={loading}>
        <Form.Item
          label={translate('name')}
          name="name"
          rules={[
            { required: true, message: 'Please enter the company name' },
            { max: 120, message: 'Company name must be 120 characters or fewer' },
          ]}
        >
          <Input placeholder={translate('name')} />
        </Form.Item>

        <Form.Item label={translate('contact')} name="contact">
          <Select
            allowClear
            showSearch
            placeholder={translate('search')}
            options={contacts}
            filterOption={false}
            loading={contactsLoading}
            onSearch={handleSearchContact}
          />
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

        <Form.Item
          label={translate('phone')}
          name="phone"
          rules={[
            {
              pattern: /^[0-9+()\-\s]*$/,
              message: 'Please enter a valid phone number',
            },
            { max: 30, message: 'Phone number must be 30 characters or fewer' },
          ]}
        >
          <Input placeholder="+1 555 0100" />
        </Form.Item>

        <Form.Item
          label={translate('email')}
          name="email"
          rules={[
            { required: true, message: 'Please enter the email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input placeholder="company@example.com" type="email" />
        </Form.Item>

        <Form.Item
          label={translate('website')}
          name="website"
          rules={[
            {
              type: 'url',
              warningOnly: true,
            },
            { max: 120, message: 'Website must be 120 characters or fewer' },
          ]}
        >
          <Input placeholder="https://www.example.com" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {company ? translate('edit') : translate('submit')}
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

export default CompanyForm;



