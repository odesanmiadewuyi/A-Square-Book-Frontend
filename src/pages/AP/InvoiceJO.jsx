import React from 'react';
import { Button, message } from 'antd';
import CrudModule from '@/modules/CrudModule/CrudModule';
import InvoiceJOForm from '@/modules/InvoiceJOModule/Forms/InvoiceJOForm';
import { request } from '@/request';
import { FileTextOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

export default function InvoiceJOPage() {
  const entity = 'invoicejo';
  const navigate = useNavigate();
  const location = useLocation();
  const Labels = {
    PANEL_TITLE: 'Invoice (Job Orders)',
    DATATABLE_TITLE: 'Invoice JO',
    ADD_NEW_ENTITY: 'Add Invoice',
    ENTITY_NAME: 'InvoiceJO',
  };

  const getReportRoute = (record) => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return {
      returnTo,
      url: `/reports/${entity}/${record._id}?autoload=1&from=${encodeURIComponent(returnTo)}`,
    };
  };

  const dataTableColumns = [
    { title: 'Invoice No', dataIndex: 'invoiceNo' },
    { title: 'Date', dataIndex: 'invoiceDate' },
    { title: 'JO', dataIndex: ['joId','joNo'], render: (_, r)=> r?.joId?.joNo || '-' },
    { title: 'Vendor', dataIndex: ['vendorId','name'], render: (_, r)=> r?.vendorId?.name || '-' },
    { title: 'Net Amount', dataIndex: 'netAmount', onCell:()=>({style:{textAlign:'right'}}), render:(v)=> (Number(v||0)).toFixed(2) },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Voucher',
      key: 'voucher',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const { url, returnTo } = getReportRoute(record);
            navigate(url, { state: { from: returnTo } });
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const readColumns = [
    { title: 'Invoice No', dataIndex: 'invoiceNo' },
    { title: 'Date', dataIndex: 'invoiceDate' },
    { title: 'JO', dataIndex: ['joId','joNo'] },
    { title: 'Vendor', dataIndex: ['vendorId','name'] },
    { title: 'Net Amount', dataIndex: 'netAmount' },
    { title: 'VAT', dataIndex: 'vatAmount' },
    { title: 'Total', dataIndex: 'grossAmount' },
    { title: 'Status', dataIndex: 'status' },
  ];

  const onMenuAction = async (action, r) => {
    if (!r?._id) return;
    const id = r._id;
    let status;
    if (action === 'view-voucher') {
      const { url, returnTo } = getReportRoute(r);
      navigate(url, { state: { from: returnTo } });
      return;
    }
    if (action === 'post') status = 'Posted';
    if (action === 'cancel') status = 'Cancelled';
    if (!status) return;
    try {
      const resp = await request.update({ entity, id, jsonData: { status } });
      if (resp?.success) {
        if (resp?.warning) message.warning(resp.warning);
        else if (resp?.message) message.success(resp.message);
        else message.success('Updated');
      }
    } catch {}
  };

  const menuExtra = [
    { key: 'view-voucher', label: 'View Voucher', icon: <FileTextOutlined /> },
    { key: 'post', label: 'Post', disabled: (r)=> r?.status === 'Posted' || r?.status === 'Cancelled' },
    { key: 'cancel', label: 'Cancel', disabled: (r)=> r?.status === 'Cancelled' },
  ];

  const searchConfig = { entity, displayLabels:['invoiceNo'], searchFields: 'invoiceNo' };

  const config = { entity, ...Labels, dataTableColumns, readColumns, searchConfig, menuExtra, onMenuAction, panelWidth: 900 };

  return (
    <CrudModule config={config} createForm={<InvoiceJOForm />} updateForm={<InvoiceJOForm />} />
  );
}
