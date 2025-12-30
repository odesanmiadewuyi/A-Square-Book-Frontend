import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';

export default function ExpenseDataTableModule({ config }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const searchConfig = { entity: 'expense', displayLabels: ['name'], searchFields: 'name' };
  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('expenses_category'), dataIndex: ['category','name'], render: (_,r)=> r?.category?.name || '-' },
    { title: translate('currency'), dataIndex: 'currency' },
    { title: translate('Total'), dataIndex: 'total', onCell:()=>({style:{textAlign:'right'}}), render:(v,r)=> moneyFormatter({amount:v||0,currency_code:r.currency}) },
    { title: translate('description'), dataIndex: 'description', ellipsis: true },
    { title: 'Ref', dataIndex: 'ref' },
  ];
  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, searchConfig }} />
    </ErpLayout>
  );
}

