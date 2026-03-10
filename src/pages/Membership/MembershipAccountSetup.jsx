import React from 'react';

import useLanguage from '@/locale/useLanguage';

import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import TaxForm from '@/forms/TaxForm';

export default function MembershipAccountSetup() {
  const translate = useLanguage();
  const entity = 'membershipaccountsetup';
  const searchConfig = {
    displayLabels: ['accountcode'],
    searchFields: 'accountcode',
    outputValue: '_id',
  };

  const deleteModalLabels = ['accountcode'];

  const readColumns = [
    { title: 'Posting Code', dataIndex: 'accountcode' },
    { title: translate('Default') || 'Default', dataIndex: 'isDefault' },
    { title: translate('enabled') || 'Enabled', dataIndex: 'enabled' },
  ];

  const dataTableColumns = [
    { title: 'Posting Code', dataIndex: 'accountcode' },
    {
      title: translate('Default') || 'Default',
      dataIndex: 'isDefault',
      key: 'isDefault',
      onCell: () => ({ props: { style: { width: '60px' } } }),
      render: (_, record) => (
        <Switch checked={record.isDefault} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      ),
    },
    {
      title: translate('enabled') || 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      onCell: () => ({ props: { style: { width: '60px' } } }),
      render: (_, record) => (
        <Switch checked={record.enabled} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: 'Membership Account Setup',
    DATATABLE_TITLE: 'Membership Account Setup',
    ADD_NEW_ENTITY: 'Add New Membership Account',
    ENTITY_NAME: 'membershipaccountsetup',
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
      createForm={<TaxForm showAccountCode={true} showName={false} showValue={false} />}
      updateForm={<TaxForm isUpdateForm={true} showAccountCode={true} showName={false} showValue={false} />}
      config={config}
    />
  );
}
