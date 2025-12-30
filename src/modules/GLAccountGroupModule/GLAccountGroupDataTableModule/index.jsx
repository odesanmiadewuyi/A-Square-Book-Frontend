import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function GLAccountGroupDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'glaccountgroup', displayLabels: ['name','code','classCode'], searchFields: 'name,code,classCode' };
  const dataTableColumns = [
    { title: 'Code', key: 'fullCode', render: (_,_row)=> `${_row.classCode || ''}${_row.code || ''}` },
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
