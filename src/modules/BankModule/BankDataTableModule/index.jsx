import { Button } from 'antd';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

export default function BankDataTableModule({ config }){
  const translate = useLanguage();
  const navigate = useNavigate();
  const searchConfig = { entity: 'bank', displayLabels: ['name','accountNumber'], searchFields: 'name,accountNumber,code' };
  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: 'Code', dataIndex: 'code' },
    { title: 'Account Name', dataIndex: 'accountName' },
    { title: 'Account Number', dataIndex: 'accountNumber' },
    { title: translate('currency') || 'Currency', dataIndex: 'currency' },
    { title: 'Posting Code', dataIndex: 'postingAccountCode' },
  ];
  return (
    <ErpLayout>
      <style>
        {`@media print {
          aside, header, .ant-layout-sider, .ant-layout-header { display: none !important; }
          .bank-print-hide { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
          .ant-table-wrapper { margin: 0 !important; }
        }`}
      </style>
      <ErpPanel
        config={{
          ...config,
          dataTableColumns,
          searchConfig,
          headerExtras: () => [
            <Button
              key="bank-print"
              className="bank-print-hide"
              onClick={() => navigate('/reports/bank/list?autoload=1')}
            >
              {translate('Print List') || 'Print List'}
            </Button>,
          ],
        }}
      />
    </ErpLayout>
  );
}
