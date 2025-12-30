import React, { useEffect, useMemo, useState } from 'react';
import { COUNTRY_OPTIONS } from '@/constants/countries';
import { Form, Input, Button, Select, Space, message, Card, Switch } from 'antd';
import { personService } from '@/request/personService';


const PersonForm = ({ person, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const countryOptions = useMemo(
    () => COUNTRY_OPTIONS.map((country) => ({ label: country, value: country })),
    []
  );

  useEffect(() => {
    if (person) {
      form.setFieldsValue({
        firstname: person.firstname || '',
        lastname: person.lastname || '',
        company: person.company || '',
        country: person.country || undefined,
        phone: person.phone || '',
        email: person.email || '',
        isActive: typeof person.isActive === 'boolean' ? person.isActive : true,
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({ isActive: true });
  }, [person, form]);


  const handleSubmit = async (values) => {
    setLoading(true);

    const sanitizedValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim();
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});

    if (sanitizedValues.country === undefined) {
      sanitizedValues.country = '';
    }
    if (sanitizedValues.company === undefined) {
      sanitizedValues.company = '';
    }
    if (sanitizedValues.phone === undefined) {
      sanitizedValues.phone = '';
    }

    try {
      const response = person
        ? await personService.updatePerson(person._id, sanitizedValues)
        : await personService.createPerson(sanitizedValues);

      message.success(
        response?.message || (person ? 'Person updated successfully' : 'Person created successfully')
      );

      if (!person) {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }

      onSuccess?.(response?.data);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        message.error(validationErrors.join('; '));
      } else {
        message.error(apiMessage || 'Unable to save person. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Card title={person ? 'Edit Person' : 'Create Person'} bordered={false}>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ isActive: true }}
        disabled={loading}
      >

        <Form.Item
          label="First Name"
          name="firstname"
          rules={[
            { required: true, message: 'Please enter the first name' },
            { max: 60, message: 'First name must be 60 characters or fewer' },
          ]}
        >
          <Input placeholder="John" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[
            { required: true, message: 'Please enter the last name' },
            { max: 60, message: 'Last name must be 60 characters or fewer' },
          ]}
        >
          <Input placeholder="Doe" />
        </Form.Item>


        <Form.Item
          label="Company"
          name="company"
          rules={[{ max: 120, message: 'Company name must be 120 characters or fewer' }]}
        >
          <Input placeholder="Company Inc." />
        </Form.Item>

        <Form.Item label="Country" name="country">
          <Select
            allowClear
            showSearch
            placeholder="Select a country"
            options={countryOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
            }
          />
        </Form.Item>


        <Form.Item
          label="Phone"
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
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter the email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input placeholder="john.doe@example.com" type="email" />
        </Form.Item>


        <Form.Item label="Status" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {person ? 'Update Person' : 'Create Person'}
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PersonForm;



