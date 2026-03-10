import React from 'react';
import { Button } from 'antd';

import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import MembershipPaymentForm from './MembershipPaymentForm';

export default function MembershipPaymentPage() {
  const translate = useLanguage();
  const entity = 'membershippayment';
  const isLocalRuntime =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || '');
  const defaultBackend =
    typeof window !== 'undefined'
      ? isLocalRuntime
        ? 'http://localhost:8888'
        : window.location.origin
      : 'http://localhost:8888';
  const rawBackend = (import.meta.env.VITE_BACKEND_SERVER || defaultBackend)
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  const backendRoot = /\/api$/i.test(rawBackend) ? rawBackend.replace(/\/api$/i, '') : rawBackend;
  const toDocumentUrl = (filePath) => {
    const src = (filePath || '').toString().trim();
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    return `${backendRoot}/${src.replace(/^\/+/, '')}`;
  };
  const openReceipt = (record, print = false) => {
    const id = record?._id;
    if (!id) return;
    const href = `/reports/membershippayment/${id}?autoload=1${print ? '&print=1' : ''}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const dataTableColumns = [
    { title: translate('Reference Number') || 'Reference Number', dataIndex: 'referenceNumber' },
    { title: translate('Name') || 'Name', dataIndex: 'name' },
    { title: translate('Category') || 'Category', dataIndex: 'categoryName' },
    { title: translate('Category Type') || 'Category Type', dataIndex: 'categoryTypeName' },
    { title: translate('Bank') || 'Bank', dataIndex: 'bankName' },
    {
      title: translate('Pay Date') || 'Pay Date',
      dataIndex: 'payDate',
      render: (value) => (value ? new Date(value).toLocaleDateString() : ''),
    },
    {
      title: translate('Amount') || 'Amount',
      dataIndex: 'amount',
      render: (value) => Number(value || 0).toFixed(2),
    },
    {
      title: translate('Active') || 'Active',
      dataIndex: 'active',
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: translate('Approval') || 'Approval',
      dataIndex: 'approvalStatus',
      render: (value) => ((value || 'Pending') === 'Approved' ? 'Approved' : 'Pending'),
    },
    {
      title: translate('Teller Document') || 'Teller Document',
      dataIndex: 'tellerDocument',
      render: (value) => {
        const href = toDocumentUrl(value);
        if (!href) return '-';
        return (
          <Button type="link" size="small" onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}>
            {translate('View') || 'View'}
          </Button>
        );
      },
    },
    {
      title: translate('Receipt') || 'Receipt',
      key: 'receipt',
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => openReceipt(record, false)}>
            {translate('View') || 'View'}
          </Button>
          <Button type="link" size="small" onClick={() => openReceipt(record, true)}>
            {translate('Print') || 'Print'}
          </Button>
        </>
      ),
    },
  ];

  const searchConfig = {
    displayLabels: ['referenceNumber', 'name', 'categoryName', 'categoryTypeName', 'bankName'],
    searchFields: 'referenceNumber,name,categoryName,categoryTypeName,bankName',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('Membership-Payment') || 'Membership-Payment',
    DATATABLE_TITLE: translate('Membership-Payment') || 'Membership-Payment',
    ADD_NEW_ENTITY: translate('Add Membership-Payment') || 'Add Membership-Payment',
    ENTITY_NAME: translate('Membership-Payment') || 'Membership-Payment',
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    deleteModalLabels: ['referenceNumber', 'name'],
    centerForm: true,
    formMaxWidth: 760,
    panelWidth: 860,
    panelAsModal: true,
    panelModalClassName: 'membership-payment-modal',
  };

  return (
    <CrudModule
      config={config}
      createForm={<MembershipPaymentForm />}
      updateForm={<MembershipPaymentForm />}
      withUpload
      autoOpenCreate={false}
    />
  );
}
