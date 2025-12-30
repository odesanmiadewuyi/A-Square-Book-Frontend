import React from 'react';
import { Button } from 'antd';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import AutoForm from '@/components/AutoForm';
import { useNavigate } from 'react-router-dom';

export default function Vendors() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const entity = 'vendor';

  const searchConfig = {
    displayLabels: ['name','tin','email','phone'],
    searchFields: 'name,tin,email,phone,bankName,bankAcct',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name','tin'];

  const fields = {
    name: { type: 'string', label: 'Vendor Name', required: true },
    tin: { type: 'string', label: 'TIN' },
    bankName: { type: 'string', label: 'Bank Name' },
    bankAcct: { type: 'string', label: 'Bank Account' },
    email: { type: 'email', label: 'Email' },
    phone: { type: 'string', label: 'Phone' },
    active: { type: 'boolean', label: 'Active' },
  };

  const dataTableColumns = [
    { title: translate('Vendor Name') || 'Vendor Name', dataIndex: 'name' },
    { title: 'TIN', dataIndex: 'tin' },
    { title: translate('Bank Name') || 'Bank Name', dataIndex: 'bankName' },
    { title: translate('Bank Account') || 'Bank Account', dataIndex: 'bankAcct' },
    { title: translate('Email') || 'Email', dataIndex: 'email' },
    { title: translate('Phone') || 'Phone', dataIndex: 'phone' },
  ];

  const Labels = {
    PANEL_TITLE: translate('Vendors') || 'Vendors',
    DATATABLE_TITLE: translate('Vendor List') || 'Vendor List',
    ADD_NEW_ENTITY: translate('Add Vendor') || 'Add Vendor',
    ENTITY_NAME: translate('Vendor') || 'Vendor',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    searchConfig,
    deleteModalLabels,
    dataTableColumns,
    headerExtras: () => [
      <Button key="vendor-print" onClick={() => navigate('/reports/vendor/list?autoload=1')}>
        {translate('Print List') || 'Print List'}
      </Button>,
    ],
  };

  return <CrudModule createForm={<AutoForm fields={fields} />} updateForm={<AutoForm fields={fields} />} config={config} />;
}
