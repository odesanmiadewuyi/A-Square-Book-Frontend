import React from 'react';
import { DollarOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

export default function ApprovedPayments() {
  const translate = useLanguage();
  const navigate = useNavigate();

  const entity = 'invoice';
  const dataTableColumns = [
    {
      title: translate('Voucher Number') || 'Voucher Number',
      dataIndex: 'voucherNumber',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/reports/invoice/${record._id}?autoload=1`)}
        >
          {record?.voucherNumber || '-'}
        </Button>
      ),
    },
    { title: translate('Client') || 'Client', dataIndex: ['client', 'name'] },
    { title: translate('Total') || 'Total', dataIndex: 'total' },
    { title: translate('Date') || 'Date', dataIndex: 'date' },
    { title: translate('Status') || 'Status', dataIndex: 'paymentStatus' },
  ];

  const config = {
    entity,
    DATATABLE_TITLE: translate('Approved Invoices') || 'Approved Invoices',
    ADD_NEW_ENTITY: translate('Record Payment') || 'Record Payment',
    disableAdd: true,
    disableEdit: true,
    disableDelete: true,
    defaultListOptions: { filter: 'approved', equal: true },
    dataTableColumns,
    extraMenuItems: [
      {
        key: 'viewVoucher',
        label: translate('View Voucher') || 'View Voucher',
      },
      { key: 'recordPayment', label: translate('Record Payment') || 'Record Payment', icon: <DollarOutlined /> },
    ],
    recordPaymentPath: '/payment/record/:id',
    onRowAction: (key, record) => {
      if (key === 'viewVoucher') {
        navigate(`/reports/invoice/${record._id}?autoload=1`);
      }
    },
  };

  return (
    <ErpLayout>
      <ErpPanel config={config} />
    </ErpLayout>
  );
}
