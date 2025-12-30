import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import DeductionForm from '@/forms/DeductionForm';

export default function VATDeductionPage(){
  const entity = 'vatdeduction';
  const Labels = {
    PANEL_TITLE: 'VAT Deductions',
    DATATABLE_TITLE: 'VAT Deductions',
    ADD_NEW_ENTITY: 'Add VAT Deduction',
    ENTITY_NAME: 'vatdeduction',
  };
  const readColumns = [
    { title: 'Client', dataIndex: 'clientID' },
    { title: 'Number', dataIndex: 'number' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'VATAmt', dataIndex: 'VATAmt' },
    { title: 'Sub Total', dataIndex: 'subTotal' },
    { title: 'Total', dataIndex: 'total' },
  ];
  const dataTableColumns = readColumns;
  const config = { entity, ...Labels, readColumns, dataTableColumns };
  return <CrudModule createForm={<DeductionForm amountField='VATAmt' amountLabel='VAT Amount'/>} updateForm={<DeductionForm amountField='VATAmt' amountLabel='VAT Amount'/>} config={config} />
}

