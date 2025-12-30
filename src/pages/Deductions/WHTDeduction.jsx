import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import DeductionForm from '@/forms/DeductionForm';

export default function WHTDeductionPage(){
  const entity = 'whtdeduction';
  const Labels = {
    PANEL_TITLE: 'WHT Deductions',
    DATATABLE_TITLE: 'WHT Deductions',
    ADD_NEW_ENTITY: 'Add WHT Deduction',
    ENTITY_NAME: 'whtdeduction',
  };
  const readColumns = [
    { title: 'Client', dataIndex: 'clientID' },
    { title: 'Number', dataIndex: 'number' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'WHTAmt', dataIndex: 'WHTAmt' },
    { title: 'Sub Total', dataIndex: 'subTotal' },
    { title: 'Total', dataIndex: 'total' },
  ];
  const dataTableColumns = readColumns;
  const config = { entity, ...Labels, readColumns, dataTableColumns };
  return <CrudModule createForm={<DeductionForm amountField='WHTAmt' amountLabel='WHT Amount'/>} updateForm={<DeductionForm amountField='WHTAmt' amountLabel='WHT Amount'/>} config={config} />
}

