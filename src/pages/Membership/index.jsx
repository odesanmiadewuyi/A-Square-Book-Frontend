import React from 'react';
import { Button, Col, Form, Input, Row, Select, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import './MembershipForm.css';

function MembershipFormFields({ translate }) {
  return (
    <div className="membership-form-porch">
      <div className="membership-porch-head">
        <h4>{translate('Member Profile') || 'Member Profile'}</h4>
      </div>
      <div className="membership-form-grid">
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Form.Item name="memberId" label={translate('Member ID') || 'Member ID'} rules={[{ required: true }]}>
            <Input size="small" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="email" label={translate('Email') || 'Email'} rules={[{ type: 'email', message: 'Please enter a valid email address' }]}>
            <Input size="small" type="email" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="firstName" label={translate('First Name') || 'First Name'} rules={[{ required: true }]}>
            <Input size="small" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="lastName" label={translate('Last Name') || 'Last Name'} rules={[{ required: true }]}>
            <Input size="small" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="phone" label={translate('Phone') || 'Phone'}>
            <Input size="small" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="membershipType" label={translate('Membership Type') || 'Membership Type'}>
            <Select
              size="small"
              options={[
                { value: 'Regular', label: 'Regular' },
                { value: 'Premium', label: 'Premium' },
                { value: 'Corporate', label: 'Corporate' },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="startDate" label={translate('Start Date') || 'Start Date'}>
            <Input size="small" placeholder="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="endDate" label={translate('End Date') || 'End Date'}>
            <Input size="small" placeholder="YYYY-MM-DD" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="status" label={translate('Status') || 'Status'}>
            <Select
              size="small"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Suspended', label: 'Suspended' },
                { value: 'Expired', label: 'Expired' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="active"
            label={translate('Active') || 'Active'}
            valuePropName="checked"
            initialValue={true}
            className="membership-active-item"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="notes" label={translate('Notes') || 'Notes'}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Col>
      </Row>
      </div>
    </div>
  );
}

export default function MembershipPage() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const entity = 'membership';

  const fields = {
    memberId: { type: 'string', label: 'Member ID', required: true },
    firstName: { type: 'string', label: 'First Name', required: true },
    lastName: { type: 'string', label: 'Last Name', required: true },
    email: { type: 'email', label: 'Email' },
    phone: { type: 'string', label: 'Phone' },
    membershipType: {
      type: 'select',
      label: 'Membership Type',
      options: [
        { value: 'Regular', label: 'Regular' },
        { value: 'Premium', label: 'Premium' },
        { value: 'Corporate', label: 'Corporate' },
      ],
    },
    startDate: { type: 'string', label: 'Start Date', placeholder: 'YYYY-MM-DD' },
    endDate: { type: 'string', label: 'End Date', placeholder: 'YYYY-MM-DD' },
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
        { value: 'Expired', label: 'Expired' },
      ],
    },
    notes: { type: 'textarea', label: 'Notes' },
    active: { type: 'boolean', label: 'Active' },
  };

  const dataTableColumns = [
    { title: translate('Member ID') || 'Member ID', dataIndex: 'memberId' },
    {
      title: translate('First Name') || 'First Name',
      dataIndex: 'firstName',
      render: (_, row) => row?.firstName || row?.fullName?.split?.(' ')?.[0] || '',
    },
    {
      title: translate('Last Name') || 'Last Name',
      dataIndex: 'lastName',
      render: (_, row) => {
        if (row?.lastName) return row.lastName;
        const parts = (row?.fullName || '').toString().trim().split(/\s+/);
        return parts.length > 1 ? parts.slice(1).join(' ') : '';
      },
    },
    { title: translate('Email') || 'Email', dataIndex: 'email' },
    { title: translate('Phone') || 'Phone', dataIndex: 'phone' },
    { title: translate('Membership Type') || 'Membership Type', dataIndex: 'membershipType' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const searchConfig = {
    displayLabels: ['memberId', 'firstName', 'lastName', 'email', 'phone', 'membershipType', 'status'],
    searchFields: 'memberId,firstName,lastName,fullName,email,phone,membershipType,status',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Membership') || 'Membership',
    DATATABLE_TITLE: translate('Membership List') || 'Membership List',
    ADD_NEW_ENTITY: translate('Add Membership') || 'Add Membership',
    ENTITY_NAME: translate('Member') || 'Member',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['memberId', 'firstName', 'lastName'],
    centerForm: true,
    formMaxWidth: 680,
    panelWidth: 820,
    panelAsModal: true,
    panelModalClassName: 'membership-modal',
    headerExtras: () => [
      <Button key="membership-print" onClick={() => navigate('/reports/membership/list?autoload=1')}>
        {translate('Print List') || 'Print List'}
      </Button>,
    ],
  };

  return (
    <CrudModule
      config={config}
      createForm={
        <div className="membership-form-compact">
          <MembershipFormFields translate={translate} />
        </div>
      }
      updateForm={
        <div className="membership-form-compact">
          <MembershipFormFields translate={translate} />
        </div>
      }
    />
  );
}
