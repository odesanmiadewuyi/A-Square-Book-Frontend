import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function GLAccountSubGroupDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'glaccountsubgroup', displayLabels: ['name','subgroupcode'], searchFields: 'name,subgroupcode' };
  const dataTableColumns = [
    { title: 'Sub-Group Code', key: 'subgroupcode', dataIndex: 'subgroupcode' },
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
