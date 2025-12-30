import React from 'react';

import useLanguage from '@/locale/useLanguage';

import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import TaxForm from '@/forms/TaxForm';

// VAT-Setup page reuses the Taxes entity with the same CRUD UX
export default function VATSetup() {
  const translate = useLanguage();
  const entity = 'vatsetup';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name'];

  const readColumns = [
    { title: translate('Name'), dataIndex: 'taxName' },
    { title: translate('Value'), dataIndex: 'taxValue' },
    { title: 'Posting Code', dataIndex: 'accountcode' },
    { title: translate('Default'), dataIndex: 'isDefault' },
    { title: translate('enabled'), dataIndex: 'enabled' },
  ];

  const dataTableColumns = [
    { title: translate('Name'), dataIndex: 'taxName' },
    {
      title: translate('Value'),
      dataIndex: 'taxValue',
      render: (_, record) => <>{record.taxValue + '%'}</>,
    },
    { title: 'Posting Code', dataIndex: 'accountcode' },
    {
      title: translate('Default'),
      dataIndex: 'isDefault',
      key: 'isDefault',
      onCell: () => ({ props: { style: { width: '60px' } } }),
      render: (_, record) => (
        <Switch checked={record.isDefault} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      ),
    },
    {
      title: translate('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      onCell: () => ({ props: { style: { width: '60px' } } }),
      render: (_, record) => (
        <Switch checked={record.enabled} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: 'VAT-Setup',
    DATATABLE_TITLE: 'VAT-Setup',
    ADD_NEW_ENTITY: translate('add_new_tax') || 'Add New VAT',
    ENTITY_NAME: 'vatsetup',
  };

  const configPage = { entity, ...Labels };
  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule createForm={<TaxForm showAccountCode={true} />} updateForm={<TaxForm isUpdateForm={true} showAccountCode={true} />} config={config} />
  );
}
