import { FileTextOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';

export default function APCustomerInvoiceDataTableModule({ config }){
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();
  const dispatch = useDispatch();
  const searchFields = 'voucherNumber';

  const getReportRoute = (record) => {
    const entity = config?.entity || 'apcustomerinvoice';
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return {
      returnTo,
      url: `/reports/${entity}/${record._id}?autoload=1&from=${encodeURIComponent(returnTo)}`,
    };
  };

  const voucherColumn = {
    title: translate('Voucher') || 'Voucher',
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
        {translate('View') || 'View'}
      </Button>
    ),
  };

  const extraMenuItems = [
    ...(Array.isArray(config?.extraMenuItems) ? config.extraMenuItems : []),
    {
      key: 'view-voucher',
      label: translate('View Voucher') || 'View Voucher',
      icon: <FileTextOutlined />,
    },
  ];

  const handleRowAction = (key, record) => {
    if (key === 'view-voucher') {
      const { url, returnTo } = getReportRoute(record);
      navigate(url, { state: { from: returnTo } });
      return;
    }
    if (typeof config?.onRowAction === 'function') {
      config.onRowAction(key, record);
    }
  };

  const columns = Array.isArray(config?.dataTableColumns)
    ? [...config.dataTableColumns, voucherColumn]
    : [voucherColumn];

  const handleSearchNumber = (value) => {
    const query = (value || '').trim();
    const baseOptions = { ...(config?.defaultListOptions || {}) };
    const entity = config?.entity || 'apcustomerinvoice';
    if (!query) {
      dispatch(erp.list({ entity, options: baseOptions }));
      return;
    }
    const match = query.match(/(\d+)/);
    const numeric = match ? Number(match[1]) : null;
    if (Number.isFinite(numeric) && numeric > 0) {
      dispatch(erp.list({ entity, options: { ...baseOptions, filter: 'number', equal: numeric } }));
      return;
    }
    dispatch(erp.list({ entity, options: { ...baseOptions, q: query, fields: searchFields } }));
  };

  const headerExtras = () => {
    const existingExtras = typeof config?.headerExtras === 'function' ? config.headerExtras() : config?.headerExtras;
    const safeExtras = Array.isArray(existingExtras) ? existingExtras : existingExtras ? [existingExtras] : [];
    return [
      <Input.Search
        key="apcustomerinvoice-search-number"
        placeholder={translate('Search Number') || 'Search Number'}
        allowClear
        size="small"
        onSearch={handleSearchNumber}
        onChange={(event) => {
          if (!event?.target?.value) handleSearchNumber('');
        }}
        style={{ width: 220 }}
      />,
      ...safeExtras,
    ];
  };

  return (
    <ErpLayout>
      <ErpPanel
        config={{
          ...config,
          dataTableColumns: columns,
          extraMenuItems,
          onRowAction: handleRowAction,
          headerExtras,
        }}
      />
    </ErpLayout>
  );
}
