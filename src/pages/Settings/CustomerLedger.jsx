import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import CustomerLedgerForm from '@/forms/CustomerLedgerForm';
import useLanguage from '@/locale/useLanguage';

export default function CustomerLedgerSettings() {
  const translate = useLanguage();

  const entity = 'customerledgersetting';

  const searchConfig = {
    displayLabels: ['code', 'name'],
    searchFields: 'code,name',
    outputValue: '_id',
  };

  const deleteModalLabels = ['code', 'name'];

  const columns = [
    { title: translate('Code') || 'Code', dataIndex: 'code' },
    { title: translate('Name') || 'Name', dataIndex: 'name' },
    { title: translate('Description') || 'Description', dataIndex: 'description' },
  ];

  const labels = {
    PANEL_TITLE: 'Customer Ledger',
    DATATABLE_TITLE: 'Customer Ledger',
    ADD_NEW_ENTITY: 'Add Customer Ledger',
    ENTITY_NAME: 'customerledgersetting',
  };

  const config = {
    entity,
    ...labels,
    readColumns: columns,
    dataTableColumns: columns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<CustomerLedgerForm />}
      updateForm={<CustomerLedgerForm isUpdateForm />}
      config={config}
    />
  );
}
