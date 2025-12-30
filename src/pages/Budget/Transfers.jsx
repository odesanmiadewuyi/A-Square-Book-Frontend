import React from 'react';
import { useNavigate } from 'react-router-dom';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { Form, InputNumber, Input, Select, Button } from 'antd';
import SelectAsync from '@/components/SelectAsync';

function TransferForm(){
  return (
    <>
      <Form.Item name='versionId' label='Version' rules={[{ required:true }]}>
        <SelectAsync entity={'budgetversion'} outputValue={'_id'} displayLabels={['code','name']} placeholder={'Select Version'} />
      </Form.Item>
      <Form.Item name='fromLineId' label='From Line' rules={[{ required:true }]}>
        <SelectAsync entity={'budgetline'} outputValue={'_id'} displayLabels={['glAccount']} placeholder={'From Budget Line'} />
      </Form.Item>
      <Form.Item name='toLineId' label='To Line' rules={[{ required:true }]}>
        <SelectAsync entity={'budgetline'} outputValue={'_id'} displayLabels={['glAccount']} placeholder={'To Budget Line'} />
      </Form.Item>
      <Form.Item name='amount' label='Amount' rules={[{ required:true }]}>
        <InputNumber step={0.01} precision={2} style={{ width:'100%' }} />
      </Form.Item>
      <Form.Item name='note' label='Note'>
        <Input />
      </Form.Item>
      <Form.Item name='status' label='Status' initialValue={'Draft'}>
        <Select options={[{value:'Draft'},{value:'Approved'},{value:'Rejected'}]} />
      </Form.Item>
    </>
  );
}

export default function BudgetTransfers(){
  const navigate = useNavigate();
  const entity = 'budgettransfer';
  const Labels = { PANEL_TITLE:'Budget Transfers', DATATABLE_TITLE:'Budget Transfers', ADD_NEW_ENTITY:'Add Transfer', ENTITY_NAME:'Budget Transfer' };
  const dataTableColumns = [
    { title:'Version', dataIndex:['versionId','code'], render:(_,r)=> r?.versionId?.code || '-' },
    { title:'From (GL)', dataIndex:['fromLineId','glAccount'], render:(_,r)=> r?.fromLineId?.glAccount || '-' },
    { title:'To (GL)', dataIndex:['toLineId','glAccount'], render:(_,r)=> r?.toLineId?.glAccount || '-' },
    { title:'Amount', dataIndex:'amount', onCell:()=>({style:{textAlign:'right'}}), render:(v)=> (Number(v||0)).toFixed(2) },
    { title:'Note', dataIndex:'note' },
    { title:'Status', dataIndex:'status' },
  ];
  const searchConfig = { entity, displayLabels:['note'], searchFields:'note' };
  const readColumns = [
    { title:'Version', dataIndex:['versionId','code'] },
    { title:'From (GL)', dataIndex:['fromLineId','glAccount'] },
    { title:'To (GL)', dataIndex:['toLineId','glAccount'] },
    { title:'Amount', dataIndex:'amount' },
    { title:'Note', dataIndex:'note' },
    { title:'Status', dataIndex:'status' },
  ];
  const config = { entity, ...Labels, dataTableColumns, readColumns, searchConfig,
    headerExtras: () => [
      <Button key="budget-transfers-print" onClick={() => navigate('/reports/budgettransfer/list?autoload=1&print=1')}>
        Print List
      </Button>,
    ],
    menuExtra:[
      { key:'approve', label:'Approve', disabled:(r)=> r?.status!=='Draft' },
      { key:'reject', label:'Reject', disabled:(r)=> r?.status!=='Draft' }
    ],
    onMenuAction: async (action, r) => {
      if (!r?._id) return;
      if (action === 'approve' || action === 'reject') {
        navigate(`/budget/transfers/approve/${r._id}`);
        return;
      }
    }
  };
  return <CrudModule config={config} createForm={<TransferForm />} updateForm={<TransferForm />} />;
}
