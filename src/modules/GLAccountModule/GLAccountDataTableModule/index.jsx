import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function GLAccountDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'glaccount', displayLabels: ['name','code'], searchFields: 'name,code' };
  const dataTableColumns = [
    { title: 'Code', dataIndex: 'code' },
    { title: translate('name'), dataIndex: 'name' },
    { title: 'Class', dataIndex: 'classCode' },
    { title: 'Parent', dataIndex: 'parentCode' },
    { title: 'Currency', dataIndex: 'currency' },
    { title: 'Control', dataIndex: 'isControl', render: (v)=> <Tag color={v ? 'gold' : 'default'}>{v ? 'Control' : '-'}</Tag> },
    { title: 'Active', dataIndex: 'active', render: (v)=> <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
  ];
  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, searchConfig }} />
    </ErpLayout>
  );
}

