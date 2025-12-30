import React from 'react';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { RequisitionCreateForm, RequisitionUpdateForm } from '@/modules/RequisitionModule/Forms/RequisitionForm';
import { request } from '@/request';
import { message } from 'antd';

export default function APRequisition() {
  const translate = useLanguage();
  const entity = 'requisition';

  const searchConfig = {
    entity,
    displayLabels: ['prNo'],
    searchFields: 'prNo,description',
  };

  const dataTableColumns = [
    { title: translate('PR No') || 'PR No', dataIndex: 'prNo' },
    { title: translate('Requester') || 'Requester', dataIndex: ['requester','name'], render: (_, r)=> r?.requester?.name || '-' },
    { title: translate('Department') || 'Department', dataIndex: ['department','name'], render: (_, r)=> r?.department?.name || '-' },
    { title: translate('Estimated Amount') || 'Estimated Amount', dataIndex: 'estAmount', onCell:()=>({ style:{ textAlign:'right' }}), render:(v)=> (Number(v||0)).toFixed(2) },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const readColumns = [
    { title: translate('PR No') || 'PR No', dataIndex: 'prNo' },
    { title: translate('Requester') || 'Requester', dataIndex: ['requester','name'] },
    { title: translate('Department') || 'Department', dataIndex: ['department','name'] },
    { title: translate('Description of work') || 'Description of work', dataIndex: 'description' },
    { title: translate('Estimated Amount') || 'Estimated Amount', dataIndex: 'estAmount', render:(v)=> (Number(v||0)).toFixed(2) },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const Labels = {
    PANEL_TITLE: translate('Purchase Requisitions') || 'Purchase Requisitions',
    DATATABLE_TITLE: translate('Requisition List') || 'Requisition List',
    ADD_NEW_ENTITY: translate('Add Requisition') || 'Add Requisition',
    ENTITY_NAME: translate('Requisition') || 'Requisition',
  };

  const handleMenuAction = async (action, record) => {
    if (!record?._id) return;
    const id = record._id;
    let newStatus = null;
    if (action === 'submit') newStatus = 'Submitted';
    if (action === 'approve') newStatus = 'Approved';
    if (action === 'reject') newStatus = 'Rejected';
    if (!newStatus) return;
    try {
      const resp = await request.update({ entity, id, jsonData: { status: newStatus } });
      if (resp?.success) message.success(`${translate('Status updated') || 'Status updated'}: ${newStatus}`);
    } catch {}
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    readColumns,
    searchConfig,
    deleteModalLabels: ['prNo','requester'],
    menuExtra: [
      { key: 'submit', label: translate('Submit') || 'Submit', disabled: (r)=> r?.status !== 'Draft' },
      { key: 'approve', label: translate('Approve') || 'Approve', disabled: (r)=> r?.status === 'Approved' },
      { key: 'reject', label: translate('Reject') || 'Reject', disabled: (r)=> r?.status === 'Rejected' },
    ],
    onMenuAction: handleMenuAction,
  };

  return (
    <CrudModule
      config={config}
      createForm={<RequisitionCreateForm />}
      updateForm={<RequisitionUpdateForm />}
    />
  );
}
