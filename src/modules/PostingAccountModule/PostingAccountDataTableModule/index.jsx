import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function PostingAccountDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'postingaccount', displayLabels: ['name','subgroupcode','postingcode'], searchFields: 'name,subgroupcode,postingcode' };
  const dataTableColumns = [
    { title: 'Sub-Group Code', key: 'subgroupcode', dataIndex: 'subgroupcode' },
    { title: 'Posting Code', key: 'postingcode', dataIndex: 'postingcode' },
    { title: 'Class', key: 'classCode', dataIndex: 'classCode' },
    { title: 'Group', key: 'groupCode', dataIndex: 'groupCode' },
    { title: 'Sub', key: 'code', dataIndex: 'code' },
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

