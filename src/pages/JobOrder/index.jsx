import React from 'react';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import JobOrderForm from './JobOrderForm';
import { request } from '@/request';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function JobOrderPage() {
  const translate = useLanguage();
  const entity = 'joborder';
  const navigate = useNavigate();

  const toPercent = (v) => {
    const n = Number(v || 0);
    const p = n > 1 ? n : n * 100; // allow either decimal (0.075) or percent (7.5)
    const fixed = Math.abs(p % 1) < 1e-9 ? p.toFixed(0) : p.toFixed(2);
    return `${fixed}%`;
  };

  // Show only the transaction head in the table
  const dataTableColumns = [
    { title: 'JO No', dataIndex: 'joNo' },
    { title: 'PR No', dataIndex: ['prId','prNo'], render: (_, r)=> r?.prId?.prNo || '-' },
    { title: translate('Vendor') || 'Vendor', dataIndex: ['vendorId','name'], render: (_, r)=> r?.vendorId?.name || '-' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const Labels = {
    PANEL_TITLE: 'Job Orders / LOA',
    DATATABLE_TITLE: 'Job Orders',
    ADD_NEW_ENTITY: 'Add Job Order',
    ENTITY_NAME: 'Job Order',
  };

  const searchConfig = { entity, displayLabels:['joNo'], searchFields: 'joNo' };

  const handleMenuAction = async (action, r) => {
    if (!r?._id) return;
    const id = r._id;
    let status;
    if (action==='issue') status='Issued';
    if (action==='accept') status='Accepted';
    if (action==='start') status='InProgress';
    if (action==='complete') status='Completed';
    if (!status) return;
    try {
      const resp = await request.update({ entity, id, jsonData: { status } });
      if (resp?.success) {
        if (resp?.warning) {
          message.warning(resp.warning);
        } else if (resp?.message) {
          message.success(resp.message);
        } else {
          message.success(`${action} done`);
        }
        // On completion/close, move user to GRN/Service Cert screen
        if (action === 'complete') {
          navigate('/ap/delivery');
        }
      }
    } catch (e) {
      // Rely on global error handler toast
    }
  };

  const menuExtra = [
    { key:'issue', label: 'Issue', disabled:(r)=> r?.status !== 'Draft' },
    { key:'accept', label: 'Accept', disabled:(r)=> r?.status !== 'Issued' },
    { key:'start', label: 'Start', disabled:(r)=> r?.status !== 'Accepted' },
    { key:'complete', label: 'Complete/Close', disabled:(r)=> r?.status !== 'InProgress' },
  ];

  // Full details shown in the right drawer when a row is clicked
  const readColumns = [
    { title: 'JO No', dataIndex: 'joNo' },
    { title: 'PR No', dataIndex: ['prId','prNo'] },
    { title: translate('Vendor') || 'Vendor', dataIndex: ['vendorId','name'] },
    { title: translate('Scope/SoW') || 'Scope/SoW', dataIndex: 'scope' },
    { title: translate('Unit Price') || 'Unit Price', dataIndex: 'unitPrice' },
    { title: translate('Quantity') || 'Quantity', dataIndex: 'qty' },
    { title: translate('VAT') || 'VAT', dataIndex: 'vatRate' },
    { title: translate('Retention') || 'Retention', dataIndex: 'retentionRate' },
    { title: translate('WHT') || 'WHT', dataIndex: 'whtRate' },
    { title: translate('Stamp Duty') || 'Stamp Duty', dataIndex: 'stampDutyRate' },
    { title: translate('Start date') || 'Start date', dataIndex: 'startDate', isDate: true },
    { title: translate('Due date') || 'Due date', dataIndex: 'dueDate', isDate: true },
    { title: translate('Currency') || 'Currency', dataIndex: 'currency' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const config = { entity, ...Labels, dataTableColumns, readColumns, searchConfig, deleteModalLabels:['joNo'], menuExtra, onMenuAction: handleMenuAction, menuExtraHeader: true, disableCreate: true, openOnRowClick: true };

  return (
    <CrudModule config={config} createForm={<JobOrderForm />} updateForm={<JobOrderForm />} />
  );
}
