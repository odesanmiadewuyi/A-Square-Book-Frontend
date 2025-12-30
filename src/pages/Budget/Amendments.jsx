import React from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { Form, InputNumber, Input, Select, Button } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { useNavigate } from 'react-router-dom';

function AmendmentForm(){
  return (
    <>
      <Form.Item name='versionId' label='Version' rules={[{ required:true }]}> 
        <SelectAsync entity={'budgetversion'} outputValue={'_id'} displayLabels={['code','name']} placeholder={'Select Version'} />
      </Form.Item>
      <Form.Item name='lineId' label='Line' rules={[{ required:true }]}> 
        <SelectAsync entity={'budgetline'} outputValue={'_id'} displayLabels={['glAccount']} placeholder={'Select Budget Line'} />
      </Form.Item>
      <Form.Item name='deltaAnnual' label='Delta Annual'> 
        <InputNumber step={0.01} precision={2} style={{ width:'100%' }} />
      </Form.Item>
      <Form.Item name='reason' label='Reason'> 
        <Input />
      </Form.Item>
      <Form.Item name='status' label='Status' initialValue={'Draft'}> 
        <Select options={[{value:'Draft'},{value:'Approved'},{value:'Rejected'}]} />
      </Form.Item>
    </>
  );
}

export default function BudgetAmendments(){
  const navigate = useNavigate();
  const entity = 'budgetamendment';
  const Labels = { PANEL_TITLE:'Budget Amendments', DATATABLE_TITLE:'Budget Amendments', ADD_NEW_ENTITY:'Add Amendment', ENTITY_NAME:'Budget Amendment' };
  const dataTableColumns = [
    { title:'Version', dataIndex:['versionId','code'], render:(_,r)=> r?.versionId?.code || '-' },
    { title:'Line (GL)', dataIndex:['lineId','glAccount'], render:(_,r)=> r?.lineId?.glAccount || '-' },
    { title:'Delta Annual', dataIndex:'deltaAnnual', onCell:()=>({style:{textAlign:'right'}}), render:(v)=> (Number(v||0)).toFixed(2) },
    { title:'Reason', dataIndex:'reason' },
    { title:'Status', dataIndex:'status' },
  ];
  const searchConfig = { entity, displayLabels:['reason'], searchFields:'reason' };
  const readColumns = [
    { title:'Version', dataIndex:['versionId','code'] },
    { title:'Line (GL)', dataIndex:['lineId','glAccount'] },
    { title:'Delta Annual', dataIndex:'deltaAnnual' },
    { title:'Reason', dataIndex:'reason' },
    { title:'Status', dataIndex:'status' },
  ];
  const config = { entity, ...Labels, dataTableColumns, readColumns, searchConfig,
    headerExtras: () => [
      <Button key="budget-amendments-print" onClick={() => navigate('/reports/budgetamendment/list?autoload=1&print=1')}>
        Print List
      </Button>,
    ],
    menuExtra:[
      { key:'approve', label:'Approve', disabled:(r)=> r?.status!=='Draft' },
      { key:'reject', label:'Reject', disabled:(r)=> r?.status!=='Draft' },
      { key:'approveForm', label:'Open Approval Form', disabled:(r)=> r?.status!=='Draft' },
    ],
    onMenuAction: async (action, r) => {
      const { request } = await import('@/request');
      let status;
      if(action==='approve') status='Approved';
      if(action==='reject') status='Rejected';
      if(action==='approveForm') {
        navigate(`/budget/amendments/approve/${r._id}`);
        return;
      }
      if(!status) return;
      await request.update({ entity, id:r._id, jsonData:{ status } });
    }
  };
  return <CrudModule config={config} createForm={<AmendmentForm />} updateForm={<AmendmentForm />} />;
}
