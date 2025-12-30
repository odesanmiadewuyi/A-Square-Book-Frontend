import React from 'react';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import RoleTitleForm from './RoleTitleForm';

export default function RoleTitlePage() {
  const translate = useLanguage();
  const entity = 'roletitle';

  const dataTableColumns = [
    { title: translate('Department') || 'Department', dataIndex: ['department','name'], render: (_, r)=> r?.department?.name || '-' },
    { title: translate('Role/Title') || 'Role/Title', dataIndex: 'name' },
    { title: translate('Description') || 'Description', dataIndex: 'description' },
  ];

  const searchConfig = {
    displayLabels: ['name','description'],
    searchFields: 'name,description',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Roles / Titles') || 'Roles / Titles',
    DATATABLE_TITLE: translate('Roles / Titles') || 'Roles / Titles',
    ADD_NEW_ENTITY: translate('Add Role/Title') || 'Add Role/Title',
    ENTITY_NAME: translate('Role/Title') || 'Role/Title',
  };

  const readColumns = [
    { title: translate('Department') || 'Department', dataIndex: ['department','name'] },
    { title: translate('Role/Title') || 'Role/Title', dataIndex: 'name' },
    { title: translate('Description') || 'Description', dataIndex: 'description' },
    { title: translate('Active') || 'Active', dataIndex: 'active' },
  ];

  const config = { entity, ...Labels, dataTableColumns, searchConfig, deleteModalLabels: ['name'], readColumns };

  return (
    <CrudModule
      config={config}
      createForm={<RoleTitleForm />}
      updateForm={<RoleTitleForm />}
    />
  );
}
