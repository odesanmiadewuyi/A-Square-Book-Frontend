import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import GLAccountSimpleForm from '@/forms/GLAccountSimpleForm';
import useLanguage from '@/locale/useLanguage';

export default function ChartOfAccountsSettings() {
  const translate = useLanguage();

  const entity = 'glaccounts';

  const searchConfig = {
    displayLabels: ['name', 'code'],
    searchFields: 'name,code',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name', 'code'];

  const readColumns = [
    { title: translate('Code') || 'Code', dataIndex: 'code' },
    { title: translate('Name') || 'Name', dataIndex: 'name' },
  ];

  const dataTableColumns = [
    { title: translate('Code') || 'Code', dataIndex: 'code' },
    { title: translate('Name') || 'Name', dataIndex: 'name' },
  ];

  const Labels = {
    PANEL_TITLE: 'Control Accounts',
    DATATABLE_TITLE: 'Control Accounts',
    ADD_NEW_ENTITY: 'Add New Control Account',
    ENTITY_NAME: 'glaccounts',
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
      createForm={<GLAccountSimpleForm />}
      updateForm={<GLAccountSimpleForm isUpdateForm={true} />}
      config={config}
    />
  );
}
