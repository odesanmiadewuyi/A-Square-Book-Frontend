import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { Tag } from 'antd';

export default function OrderDataTableModule({ config }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const searchConfig = {
    entity: 'order',
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const dataTableColumns = [
    { title: translate('number'), dataIndex: 'number' },
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('product'), dataIndex: ['product','name'], render: (_,r)=> r?.product?.name || '-' },
    { title: translate('quantity'), dataIndex: 'quantity' },
    { title: translate('price'), dataIndex: 'price', onCell:()=>({style:{textAlign:'right'}}), render:(v,r)=> moneyFormatter({amount:v||0,currency_code:r.currency}) },
    { title: translate('discount'), dataIndex: 'discount', onCell:()=>({style:{textAlign:'right'}}), render:(v,r)=> moneyFormatter({amount:v||0,currency_code:r.currency}) },
    { title: translate('Total'), dataIndex: 'total', onCell:()=>({style:{textAlign:'right'}}), render:(v,r)=> moneyFormatter({amount:v||0,currency_code:r.currency}) },
    { title: translate('status'), dataIndex: 'status', render:(v)=>(<Tag color={v==='New'?'blue':v==='Completed'?'green':'gold'}>{v||'-'}</Tag>) },
    { title: translate('Phone'), dataIndex: 'phone' },
    { title: translate('State'), dataIndex: 'state' },
    { title: translate('City'), dataIndex: 'city' },
    { title: translate('note'), dataIndex: 'note', ellipsis: true },
  ];

  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, searchConfig }} />
    </ErpLayout>
  );
}

