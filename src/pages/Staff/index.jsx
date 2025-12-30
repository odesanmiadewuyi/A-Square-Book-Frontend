import React from 'react';
import { Button } from 'antd';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import StaffForm from './StaffForm';
import { useNavigate } from 'react-router-dom';

export default function StaffPage() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const entity = 'staff';

  // Using a custom form to render department dropdown from Departments table

  const dataTableColumns = [
    { title: translate('Full Name') || 'Full Name', dataIndex: 'name' },
    { title: translate('Email') || 'Email', dataIndex: 'email' },
    { title: translate('Phone') || 'Phone', dataIndex: 'phone' },
    { title: translate('Department') || 'Department', dataIndex: ['department','name'], render: (_, r)=> r?.department?.name || '-' },
    { title: translate('Title') || 'Title', dataIndex: ['roleTitle','name'], render: (_, r)=> r?.roleTitle?.name || r?.title || '-' },
  ];

  const searchConfig = {
    displayLabels: ['name','email','phone','title'],
    searchFields: 'name,email,phone,title',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Staff') || 'Staff',
    DATATABLE_TITLE: translate('Staff List') || 'Staff List',
    ADD_NEW_ENTITY: translate('Add Staff') || 'Add Staff',
    ENTITY_NAME: translate('Staff') || 'Staff',
  };

  const readColumns = [
    { title: translate('Full Name') || 'Full Name', dataIndex: 'name' },
    { title: translate('Email') || 'Email', dataIndex: 'email' },
    { title: translate('Phone') || 'Phone', dataIndex: 'phone' },
    { title: translate('Department') || 'Department', dataIndex: ['department','name'] },
    { title: translate('Title') || 'Title', dataIndex: ['roleTitle','name'] },
    { title: translate('Active') || 'Active', dataIndex: 'active' },
  ];

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['name','email'],
    readColumns,
    headerExtras: () => [
      <Button key="staff-print" onClick={() => navigate('/reports/staff/list?autoload=1&print=1')}>
        {translate('Print List') || 'Print List'}
      </Button>,
    ],
  };

  return (
    <CrudModule
      config={config}
      createForm={<StaffForm />}
      updateForm={<StaffForm />}
    />
  );
}
