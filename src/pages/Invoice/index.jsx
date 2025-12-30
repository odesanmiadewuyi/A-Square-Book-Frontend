import { useState } from 'react';
import dayjs from 'dayjs';
import { Button, message } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { formatVoucherNumber } from '@/utils/helpers';

import { useMoney, useDate } from '@/settings';
import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { useNavigate } from 'react-router-dom';

export default function Invoice() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'invoice';
  const { moneyFormatter } = useMoney();
  const navigate = useNavigate();
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const handleViewVoucher = () => {
    if (!selectedVoucherId) {
      message.warning(translate('Select voucher') || 'Select voucher');
      return;
    }
    navigate(`/reports/invoice/${selectedVoucherId}?autoload=1`);
  };
  const handlePrintVoucher = () => {
    if (!selectedVoucherId) {
      message.warning(translate('Select voucher') || 'Select voucher');
      return;
    }
    navigate(`/reports/invoice/${selectedVoucherId}?autoload=1&print=1`);
  };

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['number', 'client.name'];
  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
      render: (value, record) => record.displayNumber || formatVoucherNumber(value || 0),
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('expired Date'),
      dataIndex: 'expiredDate',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({ amount: total, currency_code: record.currency });
      },
    },
    {
      title: translate('paid'),
      dataIndex: 'credit',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
    {
      title: translate('Payment'),
      dataIndex: 'paymentStatus',
    },
    {
      title: translate('created_by'),
      dataIndex: ['createdBy', 'name'],
      render: (value) => value || '-',
    },

  ];

  const Labels = {
    PANEL_TITLE: translate('invoice'),
    DATATABLE_TITLE: translate('invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_invoice'),
    ENTITY_NAME: translate('invoice'),

    RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
    moduleKey: 'expenses',
  };
  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
    headerExtras: () => [
      <div key="invoice-view-voucher" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 220 }}>
          <AutoCompleteAsync
            entity={'invoice'}
            displayLabels={['voucherNumber']}
            searchFields={'voucherNumber'}
            outputValue={'_id'}
            onChange={(value) => setSelectedVoucherId(value || null)}
            size="small"
            placeholder={translate('Select voucher') || 'Select voucher'}
          />
        </div>
        <Button size="small" onClick={handleViewVoucher}>
          {translate('View Voucher') || 'View Voucher'}
        </Button>
        <Button size="small" onClick={handlePrintVoucher}>
          {translate('Print Voucher') || 'Print Voucher'}
        </Button>
      </div>,
    ],
    transformDeleteLabel: ({ current }) => {
      const number = current
        ? current.displayNumber || formatVoucherNumber(current.number)
        : '';
      const clientName = current?.client?.name ? ` ${current.client.name}` : '';
      return ` ${number}${clientName}`;
    },
  };

  return <InvoiceDataTableModule config={config} />;
}

