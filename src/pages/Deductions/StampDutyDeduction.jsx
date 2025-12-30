import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import DeductionForm from '@/forms/DeductionForm';

export default function StampDutyDeductionPage(){
  const entity = 'stampdutydeduction';
  const Labels = {
    PANEL_TITLE: 'Stamp Duty Deductions',
    DATATABLE_TITLE: 'Stamp Duty Deductions',
    ADD_NEW_ENTITY: 'Add Stamp Duty Deduction',
    ENTITY_NAME: 'stampdutydeduction',
  };
  const readColumns = [
    { title: 'Client', dataIndex: 'clientID' },
    { title: 'Number', dataIndex: 'number' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'StampAmt', dataIndex: 'StampAmt' },
    { title: 'Sub Total', dataIndex: 'subTotal' },
    { title: 'Total', dataIndex: 'total' },
  ];
  const dataTableColumns = readColumns;
  const config = { entity, ...Labels, readColumns, dataTableColumns };
  return <CrudModule createForm={<DeductionForm amountField='StampAmt' amountLabel='Stamp Duty Amount'/>} updateForm={<DeductionForm amountField='StampAmt' amountLabel='Stamp Duty Amount'/>} config={config} />
}

