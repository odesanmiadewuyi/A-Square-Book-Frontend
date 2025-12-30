import dayjs from 'dayjs';
import { Tag } from 'antd';
import LeadOfferDataTableModule from '@/modules/LeadOfferModule/LeadOfferDataTableModule';
import { useMoney, useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

const STATUS_COLORS = {
  Draft: 'default',
  Pending: 'gold',
  Sent: 'blue',
  Accepted: 'green',
  Declined: 'volcano',
  Canceled: 'red',
};

export default function LeadOffers() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const entity = 'lead-offers';

  const searchConfig = {
    entity: 'lead',
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['number'];

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('lead'),
      dataIndex: ['lead', 'name'],
      render: (_, record) => record?.lead?.name || '-',
    },
    {
      title: translate('date'),
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format(dateFormat) : '-'),
    },
    {
      title: translate('expired Date'),
      dataIndex: 'expiredDate',
      render: (value) => (value ? dayjs(value).format(dateFormat) : '-'),
    },
    {
      title: translate('Sub Total'),
      dataIndex: 'subTotal',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (value, record) => moneyFormatter({ amount: value || 0, currency_code: record.currency }),
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (value, record) => moneyFormatter({ amount: value || 0, currency_code: record.currency }),
    },
    {
      title: translate('status'),
      dataIndex: 'status',
      render: (value) => <Tag color={STATUS_COLORS[value] || 'default'}>{value || '-'}</Tag>,
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('offers_for_leads'),
    DATATABLE_TITLE: translate('offers_for_leads'),
    ADD_NEW_ENTITY: translate('add_new_offer_for_lead'),
    ENTITY_NAME: translate('offer_leads'),
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <LeadOfferDataTableModule config={config} />;
}
