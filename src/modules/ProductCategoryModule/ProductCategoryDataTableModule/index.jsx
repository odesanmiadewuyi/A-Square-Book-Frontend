import { Button } from 'antd';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

export default function ProductCategoryDataTableModule({ config }) {
  const translate = useLanguage();
  const navigate = useNavigate();
  const searchConfig = {
    entity: 'productcategory',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('description'), dataIndex: 'description' },
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
              key="product-category-print"
              onClick={() => navigate('/reports/productcategory/list?autoload=1')}
            >
              {translate('Print List') || 'Print List'}
            </Button>,
          ],
        }}
      />
    </ErpLayout>
  );
}
