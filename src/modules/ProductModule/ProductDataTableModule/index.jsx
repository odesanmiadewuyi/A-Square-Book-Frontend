import { Button, Tag } from 'antd';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { useNavigate } from 'react-router-dom';

export default function ProductDataTableModule({ config }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const navigate = useNavigate();
  const searchConfig = {
    entity: 'product',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    {
      title: translate('product_category'),
      dataIndex: ['category', 'name'],
      render: (_, r) => r?.category?.name || '-',
    },
    {
      title: translate('price'),
      dataIndex: 'price',
      onCell: () => ({ style: { textAlign: 'right', whiteSpace: 'nowrap', direction: 'ltr' } }),
      render: (value, record) => moneyFormatter({ amount: value || 0, currency_code: record.currency }),
    },
    {
      title: translate('status') || 'Status',
      dataIndex: 'enabled',
      render: (value) => <Tag color={value ? 'green' : 'red'}>{value ? 'Enabled' : 'Disabled'}</Tag>,
    },
  ];

  return (
    <ErpLayout>
      <ErpPanel
        config={{
          ...config,
          dataTableColumns,
          searchConfig,
          headerExtras: () => [
            <Button
              key="product-print"
              onClick={() => navigate('/reports/product/list?autoload=1')}
            >
              {translate('Print List') || 'Print List'}
            </Button>,
          ],
        }}
      />
    </ErpLayout>
  );
}
