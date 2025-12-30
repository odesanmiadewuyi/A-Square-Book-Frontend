import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import JobOrderForm from './JobOrderForm';

export default function JobOrderCreatePage() {
  const config = {
    entity: 'joborder',
    PANEL_TITLE: 'Job Orders / LOA',
    DATATABLE_TITLE: 'Job Orders',
    ADD_NEW_ENTITY: 'Add Job Order',
    ENTITY_NAME: 'joborder',
    pathPrefix: 'ap/joborder',
    stayOnCreateAfterSave: true,
  };
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={JobOrderForm} />
    </ErpLayout>
  );
}
