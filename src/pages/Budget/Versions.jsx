import React, { useState } from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { Button, Form, Input, Select, Modal, Typography, Input as AntInput, message } from 'antd';
import SelectFiscalYear from '@/components/SelectFiscalYear';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { crud } from '@/redux/crud/actions';

function VersionForm(){
  return (
    <>
      <Form.Item name='code' label='Code'>
        <Input readOnly disabled />
      </Form.Item>
      <Form.Item name='name' label='Name'>
        <Input />
      </Form.Item>
      <Form.Item name='fiscalYear' label='Fiscal Year' rules={[{ required:true }]}> 
        <SelectFiscalYear />
      </Form.Item>
      <Form.Item name='type' label='Type' rules={[{ required:true }]}> 
        <Select options={[{value:'Original'},{value:'Revised'},{value:'Forecast'}]} />
      </Form.Item>
      <Form.Item name='status' label='Status' initialValue={'Draft'}> 
        <Select options={[{value:'Draft'},{value:'Submitted'},{value:'Approved'},{value:'Locked'}]} />
      </Form.Item>
    </>
  );
}

export default function BudgetVersions(){
  const entity = 'budgetversion';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusModal, setStatusModal] = useState({ open:false, next:'', record:null, note:'' });
  const handlePrintList = () => {
    navigate('/reports/budgetversion/list?autoload=1');
  };
  const Labels = { PANEL_TITLE:'Budget Versions', DATATABLE_TITLE:'Budget Versions', ADD_NEW_ENTITY:'Add Version', ENTITY_NAME:'Budget Version' };
  const dataTableColumns = [
    { title:'Code', dataIndex:'code' },
    { title:'Name', dataIndex:'name' },
    { title:'Year', dataIndex:'fiscalYear' },
    { title:'Type', dataIndex:'type' },
    { title:'Status', dataIndex:'status' },
  ];
  const searchConfig = { entity, displayLabels:['code','name'], searchFields:'code,name' };
  const config = { entity, ...Labels, dataTableColumns, searchConfig,
    headerExtras: () => [
      <Button key="budget-versions-print" onClick={handlePrintList}>
        Print List
      </Button>,
    ],
    menuExtra:[
      // Approve directly (no Submit step)
      { key:'approve', label:'Approve', disabled:(r)=> ['Approved','Locked'].includes(r?.status) },
      { key:'lock', label:'Lock', disabled:(r)=> r?.status!=='Approved' },
    ],
    onMenuAction: async (action, r) => {
      let next = '';
      if(action==='approve') next='Approved';
      if(action==='lock') next='Locked';
      if(!next) return;
      setStatusModal({ open:true, next, record:r, note:'' });
    }
  };

  const handleStatusOk = async () => {
    try {
      const { request } = await import('@/request');
      await request.update({ entity, id: statusModal.record._id, jsonData: { status: statusModal.next } });
      message.success(`${statusModal.next} successfully`);
      setStatusModal({ open:false, next:'', record:null, note:'' });
      // Refresh the list so the new status is visible immediately
      dispatch(crud.list({ entity, options: {} }));
    } catch (_) {
      setStatusModal({ open:false, next:'', record:null, note:'' });
    }
  };
  const handleStatusCancel = () => setStatusModal({ open:false, next:'', record:null, note:'' });

  return (
    <>
      <CrudModule config={config} createForm={<VersionForm />} updateForm={<VersionForm />} />
      <Modal
        title={`${statusModal.next} Version`}
        open={statusModal.open}
        okText={statusModal.next}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        destroyOnClose
      >
        <Typography.Paragraph>
          You are about to set this version to <strong>{statusModal.next}</strong>.
          {statusModal.next==='Locked' ? ' Locked versions cannot be edited.' : ''}
        </Typography.Paragraph>
        <AntInput.TextArea rows={3} placeholder={'Optional note'} value={statusModal.note} onChange={(e)=> setStatusModal({ ...statusModal, note:e.target.value })} />
      </Modal>
    </>
  );
}
