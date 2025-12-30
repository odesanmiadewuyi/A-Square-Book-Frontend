import React from 'react';

import useLanguage from '@/locale/useLanguage';

import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import TaxForm from '@/forms/TaxForm';

// Retention Setup page using its own entity/table
export default function RetentionSetup() {
  const translate = useLanguage();
  const entity = 'retentionsetup';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: '_id',
  };

  const deleteModalLabels = ['taxName'];

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
    PANEL_TITLE: 'Retention Setup',
    DATATABLE_TITLE: 'Retention Setup',
    ADD_NEW_ENTITY: 'Add New Retention',
    ENTITY_NAME: 'retentionsetup',
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
    <CrudModule
      createForm={<TaxForm showAccountCode={true} />}
      updateForm={<TaxForm isUpdateForm={true} showAccountCode={true} />}
      config={config}
    />
  );
}
