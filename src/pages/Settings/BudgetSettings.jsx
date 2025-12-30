import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { Form, Input, InputNumber, DatePicker, Select, Checkbox } from 'antd';

function BudgetSettingsForm() {
  return (
    <>
      <Form.Item name='fiscalYearStart' label='Fiscal Year Start' rules={[{ required: true, type:'object' }]}> 
        <DatePicker style={{ width:'100%' }} />
      </Form.Item>
      <Form.Item name='fiscalPeriods' label='Fiscal Periods' initialValue={12}> 
        <InputNumber min={1} style={{ width:'100%' }} />
      </Form.Item>
      <Form.Item name='baseCurrency' label='Base Currency' initialValue={'NGN'}> 
        <Input />
      </Form.Item>
      <Form.Item name='controlMode' label='Control Mode' initialValue={'Advisory'}> 
        <Select options={[{value:'Hard',label:'Hard Stop'},{value:'Soft',label:'Soft Warn'},{value:'Advisory',label:'Advisory'}]} />
      </Form.Item>
      <Form.Item name='tolerancePct' label='Tolerance %' initialValue={0}> 
        <InputNumber min={0} max={100} style={{ width:'100%' }} />
      </Form.Item>
      <Form.Item name='defaultPhasing' label='Default Phasing' initialValue={'Even'}> 
        <Select options={[{value:'Even',label:'Even'},{value:'Front',label:'Front-loaded'},{value:'Back',label:'Back-loaded'}]} />
      </Form.Item>
      <Form.Item name='versionTypes' label='Version Types' initialValue={['Original','Revised','Forecast']}> 
        <Checkbox.Group options={[{label:'Original',value:'Original'},{label:'Revised',value:'Revised'},{label:'Forecast',value:'Forecast'}]} />
      </Form.Item>
    </>
  );
}

export default function BudgetSettingsPage(){
  const entity = 'budgetsetting';
  const Labels = { PANEL_TITLE:'Budget Settings', DATATABLE_TITLE:'Budget Settings', ADD_NEW_ENTITY:'Add Settings', ENTITY_NAME:'Budget Settings' };
  const dataTableColumns = [
    { title:'Fiscal Year Start', dataIndex:'fiscalYearStart' },
    { title:'Periods', dataIndex:'fiscalPeriods' },
    { title:'Currency', dataIndex:'baseCurrency' },
    { title:'Mode', dataIndex:'controlMode' },
    { title:'Tolerance %', dataIndex:'tolerancePct' },
    { title:'Phasing', dataIndex:'defaultPhasing' },
  ];
  const searchConfig = { entity, displayLabels:['baseCurrency'], searchFields:'baseCurrency,controlMode' };
  const config = { entity, ...Labels, dataTableColumns, searchConfig };
  return <CrudModule config={config} createForm={<BudgetSettingsForm />} updateForm={<BudgetSettingsForm />} />;
}

