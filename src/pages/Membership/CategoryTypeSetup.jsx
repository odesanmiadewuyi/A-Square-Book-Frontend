import React from 'react';

import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import CategoryTypeSetupForm from './CategoryTypeSetupForm';

export default function MembershipCategoryTypeSetupPage() {
  const translate = useLanguage();
  const entity = 'membershipcategorytype';

  const dataTableColumns = [
    { title: translate('Reference Number') || 'Reference Number', dataIndex: 'categoryTypeId' },
    { title: translate('Category Code') || 'Category Code', dataIndex: 'categoryCode' },
    { title: translate('Category Name') || 'Category Name', dataIndex: 'categoryName' },
    { title: translate('Category Type') || 'Category Type', dataIndex: 'categoryType' },
    {
      title: translate('Amount') || 'Amount',
      dataIndex: 'amount',
      render: (value) => Number(value || 0).toFixed(2),
    },
    { title: translate('Description') || 'Description', dataIndex: 'description' },
    {
      title: translate('Active') || 'Active',
      dataIndex: 'active',
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  const searchConfig = {
    displayLabels: ['categoryTypeId', 'categoryCode', 'categoryName', 'categoryType'],
    searchFields: 'categoryTypeId,categoryCode,categoryName,categoryType',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Category-Type Setup') || 'Category-Type Setup',
    DATATABLE_TITLE: translate('Category-Type Setup') || 'Category-Type Setup',
    ADD_NEW_ENTITY: translate('Add Category Type') || 'Add Category Type',
    ENTITY_NAME: translate('Category Type') || 'Category Type',
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['categoryTypeId', 'categoryName', 'categoryType'],
  };

  return (
    <CrudModule
      config={config}
      createForm={<CategoryTypeSetupForm />}
      updateForm={<CategoryTypeSetupForm />}
    />
  );
}
