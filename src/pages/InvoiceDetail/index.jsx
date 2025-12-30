import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, message } from 'antd';
import { CheckOutlined, FilePdfOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { request } from '@/request';
import { crud } from '@/redux/crud/actions';

export default function InvoiceDetail() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const entity = 'invoicedetail';
  const [approving, setApproving] = useState(false);

  const searchConfig = {
    displayLabels: ['voucherNumber', 'description'],
    searchFields: 'voucherNumber,description',
  };

  const viewVoucherFromRecord = (record) => {
    const invoiceId = record?.invoice?._id || record?.invoice;
    if (!invoiceId) {
      message.warning(translate('Voucher not found') || 'Voucher not found');
      return;
    }
    navigate(`/reports/invoice/${invoiceId}?autoload=1`);
  };

  const readColumns = [
    { title: translate('Voucher Number'), dataIndex: 'voucherNumber' },
    { title: translate('Description'), dataIndex: 'description' },
    { title: translate('Quantity'), dataIndex: 'quantity' },
    { title: translate('Total'), dataIndex: 'total' },
    {
      title: translate('Invoice Approved') || 'Invoice Approved',
      dataIndex: ['invoice', 'approved'],
      render: (value, record) => {
        const v = typeof value === 'boolean' ? value : !!record.invoiceApproved;
        return v ? translate('Yes') || 'Yes' : translate('No') || 'No';
      },
    },
  ];

  const dataTableColumns = [
    {
      title: translate('Voucher Number'),
      dataIndex: 'voucherNumber',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => viewVoucherFromRecord(record)}>
          {record?.voucherNumber || '-'}
        </Button>
      ),
    },
    { title: translate('Description'), dataIndex: 'description' },
    { title: translate('Quantity'), dataIndex: 'quantity' },
    { title: translate('Total'), dataIndex: 'total' },
    {
      title: translate('Invoice Approved') || 'Invoice Approved',
      dataIndex: ['invoice', 'approved'],
      render: (value, record) => {
        const v = typeof value === 'boolean' ? value : !!record.invoiceApproved;
        return v ? translate('Yes') || 'Yes' : translate('No') || 'No';
      },
    },
  ];

  const approveRows = async (rows) => {
    const pendingInvoiceIds = new Set();
    rows.forEach((row) => {
      const invoiceId =
        row?.invoice?._id || (typeof row?.invoice === 'string' ? row.invoice : null);
      const isApproved = row?.invoice?.approved;
      if (invoiceId && !isApproved) {
        pendingInvoiceIds.add(invoiceId.toString());
      }
    });

    if (pendingInvoiceIds.size === 0) {
      message.info(
        translate('No pending invoices selected') || 'No pending invoices selected for approval'
      );
      return;
    }

    setApproving(true);
    let successCount = 0;
    let failureCount = 0;
    const approvedIds = [];

    try {
      for (const invoiceId of pendingInvoiceIds) {
        try {
          const response = await request.post({
            entity: `invoice/approve/${invoiceId}`,
            jsonData: {},
          });
          if (response?.success) {
            successCount += 1;
            approvedIds.push(invoiceId);
          } else {
            failureCount += 1;
          }
        } catch (error) {
          failureCount += 1;
        }
      }

      if (successCount > 0) {
        const successText = translate('Invoices approved') || 'Invoices approved';
        message.success(`${successText}: ${successCount}`);
      }
      if (failureCount > 0) {
        const failureText =
          translate('Invoices failed to approve') || 'Invoices failed to approve';
        message.error(`${failureText}: ${failureCount}`);
      }
      // Do not navigate automatically anymore; just refresh the list
      dispatch(crud.list({ entity }));
    } finally {
      setApproving(false);
    }
  };

  const handleMenuAction = async (action, record) => {
    if (action === 'approve') {
      await approveRows([record]);
      return;
    }
    if (action === 'viewVoucher') {
      const invoiceId = record?.invoice?._id || record?.invoice;
      if (!invoiceId) {
        message.warning(translate('Voucher not found') || 'Voucher not found');
        return;
      }
      navigate(`/reports/invoice/${invoiceId}?autoload=1`);
    }
  };

  const config = {
    entity,
    PANEL_TITLE: translate('Invoice Details') || 'Invoice Details',
    DATATABLE_TITLE: translate('Invoice Detail List') || 'Invoice Detail List',
    ADD_NEW_ENTITY: translate('Invoice Detail') || 'Invoice Detail',
    ENTITY_NAME: translate('Invoice Detail') || 'Invoice Detail',
    moduleKey: 'expenses',
    searchConfig,
    readColumns,
    dataTableColumns,
    deleteModalLabels: ['voucherNumber'],
    disableCreate: true,
    disableEdit: true,
    disableDelete: true,
    menuExtra: [
      {
        key: 'viewVoucher',
        label: translate('View Voucher') || 'View Voucher',
        icon: <FilePdfOutlined />,
      },
      {
        key: 'approve',
        label: translate('Approve Invoice') || 'Approve Invoice',
        icon: <CheckOutlined />,
        disabled: (record) => (record?.invoice?.approved ?? record?.invoiceApproved) === true,
      },
    ],
    onMenuAction: handleMenuAction,
    onRowRead: (record) => {
      const id = record?.invoice?._id || record?.invoice;
      if (id) navigate(`/invoice/read/${id}`);
    },
    selectionActions: [
      {
        key: 'approveSelected',
        label: translate('Approve Selected') || 'Approve Selected',
        icon: <CheckOutlined />,
        onAction: approveRows,
        loading: approving,
        disabled: (rows) =>
          approving || rows.every((row) => (row?.invoice?.approved ?? row?.invoiceApproved) === true),
      },
    ],
  };

  return <CrudModule config={config} />;
}
