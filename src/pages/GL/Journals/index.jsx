import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';

export default function GLJournals(){
  const translate = useLanguage();
  const entity = 'gljournal';
  const deleteModalLabels = ['number','description'];
  const Labels = {
    PANEL_TITLE: 'Journals',
    DATATABLE_TITLE: 'Journals',
    ADD_NEW_ENTITY: 'Add New Journal',
    ENTITY_NAME: 'gljournal',
  };
  const dataTableColumns = [
    { title: 'Number', dataIndex: 'number', key: 'number' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Period', dataIndex: ['period','name'], key: 'period' },
    { title: translate('description'), dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];
  const searchConfig = { entity: 'gljournal', displayLabels: ['number','description'], searchFields: 'number,description' };
  const config = { entity, ...Labels, deleteModalLabels, dataTableColumns, searchConfig };
  return (
    <ErpLayout>
      <ErpPanel config={config} />
    </ErpLayout>
  );
}

