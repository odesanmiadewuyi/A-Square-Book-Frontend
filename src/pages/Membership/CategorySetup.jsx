import React from 'react';

import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import AutoForm from '@/components/AutoForm';

export default function MembershipCategorySetupPage() {
  const translate = useLanguage();
  const entity = 'membershipcategory';

  const fields = {
    code: {
      type: 'string',
      label: 'Category Code',
      placeholder: 'Auto-generated',
      disabled: true,
    },
    name: { type: 'string', label: 'Category Name', required: true },
    description: { type: 'textarea', label: 'Description' },
    active: { type: 'boolean', label: 'Active' },
  };

  const dataTableColumns = [
    { title: translate('Category Code') || 'Category Code', dataIndex: 'code' },
    { title: translate('Category Name') || 'Category Name', dataIndex: 'name' },
    { title: translate('Description') || 'Description', dataIndex: 'description' },
    {
      title: translate('Active') || 'Active',
      dataIndex: 'active',
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  const searchConfig = {
    displayLabels: ['code', 'name'],
    searchFields: 'code,name',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Category Setup') || 'Category Setup',
    DATATABLE_TITLE: translate('Category Setup') || 'Category Setup',
    ADD_NEW_ENTITY: translate('Add Category') || 'Add Category',
    ENTITY_NAME: translate('Category') || 'Category',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['code', 'name'],
  };

  return <CrudModule config={config} createForm={<AutoForm fields={fields} />} updateForm={<AutoForm fields={fields} />} />;
}
