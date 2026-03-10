import React from 'react';

import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import CategoryPaymentSetupForm from './CategoryPaymentSetupForm';

export default function MembershipCategoryPaymentSetupPage() {
  const translate = useLanguage();
  const entity = 'membershipcategorypayment';

  const dataTableColumns = [
    { title: translate('Category Code') || 'Category Code', dataIndex: 'categoryCode' },
    { title: translate('Category Name') || 'Category Name', dataIndex: 'categoryName' },
    {
      title: translate('Amount') || 'Amount',
      dataIndex: 'amount',
      render: (value) => Number(value || 0).toFixed(2),
    },
    {
      title: translate('Active') || 'Active',
      dataIndex: 'active',
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  const searchConfig = {
    displayLabels: ['categoryCode', 'categoryName'],
    searchFields: 'categoryCode,categoryName',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Category Payment Setup') || 'Category Payment Setup',
    DATATABLE_TITLE: translate('Category Payment Setup') || 'Category Payment Setup',
    ADD_NEW_ENTITY: translate('Add Category Payment') || 'Add Category Payment',
    ENTITY_NAME: translate('Category Payment') || 'Category Payment',
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['categoryName', 'amount'],
  };

  return <CrudModule config={config} createForm={<CategoryPaymentSetupForm />} updateForm={<CategoryPaymentSetupForm />} />;
}
