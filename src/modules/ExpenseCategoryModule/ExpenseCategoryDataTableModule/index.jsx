import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag, Switch } from 'antd';

export default function ExpenseCategoryDataTableModule({ config }) {
  const translate = useLanguage();
  const searchConfig = { entity: 'expensecategory', displayLabels: ['name'], searchFields: 'name' };
  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('description'), dataIndex: 'description' },
    { title: 'Color', dataIndex: 'color', render:(v)=> v ? (<Tag color={v}>{v}</Tag>) : '-' },
    { title: 'Enabled', dataIndex: 'enabled', render:(v)=> <Switch checked={!!v} disabled /> },
  ];
  return (
    <ErpLayout>
      <ErpPanel config={{ ...config, dataTableColumns, searchConfig }} />
    </ErpLayout>
  );
}

