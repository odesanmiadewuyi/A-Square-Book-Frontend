import React from 'react';
import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import DeliveryForm from './DeliveryForm';
import { request } from '@/request';
import { message } from 'antd';
import { useDate } from '@/settings';

export default function DeliveryPage() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'delivery';

  const dataTableColumns = [
    { title: translate('Type') || 'Type', dataIndex: 'kind' },
    { title: translate('Reference No') || 'Reference No', dataIndex: 'referenceNo' },
    { title: 'JO No', dataIndex: ['joId','joNo'], render: (_, r)=> r?.joId?.joNo || '-' },
    { title: translate('Vendor') || 'Vendor', dataIndex: ['vendorId','name'], render: (_, r)=> r?.vendorId?.name || '-' },
    { title: translate('Items/Services') || 'Items/Services', dataIndex: 'description' },
    { title: translate('Quantity') || 'Quantity', dataIndex: 'deliveredQty', onCell:()=>({style:{textAlign:'right'}}) },
    {
      title: translate('Date') || 'Date',
      dataIndex: 'deliveredAt',
      render: (value) => (value ? dayjs(value).format(dateFormat) : '-'),
    },
    { title: translate('Location') || 'Location', dataIndex: ['location','name'], render: (_, r)=> r?.location?.name || '-' },
    { title: translate('Accepted by') || 'Accepted by', dataIndex: 'approvedBy' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const Labels = {
    PANEL_TITLE: 'Goods Received Note / Service Certificate',
    DATATABLE_TITLE: 'Deliveries',
    ADD_NEW_ENTITY: 'Add Delivery',
    ENTITY_NAME: 'Delivery',
  };

  const searchConfig = { entity, displayLabels:['description'], searchFields: 'description' };

  const handleMenuAction = async (action, r) => {
    if (!r?._id) return;
    const id = r._id;
    if (action !== 'approve') return;
    try { const resp = await request.update({ entity, id, jsonData: { status: 'Approved' } }); if (resp?.success) message.success('Approved'); } catch {}
  };

  const menuExtra = [
    { key:'approve', label:'Approve', disabled:(r)=> r?.status === 'Approved' },
  ];

  const readColumns = [
    { title: translate('Type') || 'Type', dataIndex: 'kind' },
    { title: translate('Reference No') || 'Reference No', dataIndex: 'referenceNo' },
    { title: 'JO No', dataIndex: ['joId','joNo'] },
    { title: translate('Vendor') || 'Vendor', dataIndex: ['vendorId','name'] },
    { title: translate('Items/Services') || 'Items/Services', dataIndex: 'description' },
    { title: translate('Description') || 'Description', dataIndex: 'note' },
    { title: translate('Quantity') || 'Quantity', dataIndex: 'deliveredQty' },
    { title: translate('Date') || 'Date', dataIndex: 'deliveredAt', isDate: true },
    { title: translate('Location') || 'Location', dataIndex: ['location','name'] },
    { title: translate('Accepted by') || 'Accepted by', dataIndex: 'approvedBy' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const config = { entity, ...Labels, dataTableColumns, searchConfig, readColumns, deleteModalLabels:['referenceNo','description'], menuExtra, onMenuAction: handleMenuAction, hideAddHeader: true };

  return (
    <CrudModule config={config} createForm={<DeliveryForm />} updateForm={<DeliveryForm />} />
  );
}
