import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function GLAccountClassDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'glaccountclass', displayLabels: ['name','code'], searchFields: 'name,code' };
  const dataTableColumns = [
    { title: 'Code', dataIndex: 'code' },
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('description'), dataIndex: 'description' },
    { title: 'Enabled', dataIndex: 'enabled', render:(v)=> <Tag color={v?'green':'red'}>{v?'Enabled':'Disabled'}</Tag> },
  ];
  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, searchConfig }} />
    </ErpLayout>
  );
}

