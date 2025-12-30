import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';

export default function GLPeriods(){
  const translate = useLanguage();
  const entity = 'glperiod';
  const deleteModalLabels = ['fiscalYear','month'];
  const Labels = {
    PANEL_TITLE: 'Periods',
    DATATABLE_TITLE: 'Periods',
    ADD_NEW_ENTITY: 'Add New Period',
    ENTITY_NAME: 'glperiod',
  };
  const dataTableColumns = [
    { title: 'Year', dataIndex: 'fiscalYear', key: 'fiscalYear' },
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Start', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Status', dataIndex: 'status', key: 'status', render:(v)=> <Tag color={v==='open'?'green': v==='closed'?'red':'orange'}>{v}</Tag> },
  ];
  const searchConfig = { entity: 'glperiod', displayLabels: ['fiscalYear','month'], searchFields: 'fiscalYear,month' };
  const config = { entity, ...Labels, deleteModalLabels, dataTableColumns, searchConfig };
  return (
    <ErpLayout>
      <ErpPanel config={config} />
    </ErpLayout>
  );
}


