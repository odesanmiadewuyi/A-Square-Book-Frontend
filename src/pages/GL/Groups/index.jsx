import useLanguage from '@/locale/useLanguage';
import { GLAccountGroupDataTableModule } from '@/modules/GLAccountGroupModule';

export default function GLAccountGroups(){
  const translate = useLanguage();
  const entity = 'glaccountgroup';
  const deleteModalLabels = ['name','code'];
  const Labels = {
    PANEL_TITLE: 'Account Groups',
    DATATABLE_TITLE: 'Account Groups',
    ADD_NEW_ENTITY: 'Add New Account Group',
    ENTITY_NAME: 'glaccountgroup',
  };
  const config = { entity, ...Labels, deleteModalLabels };
  return <GLAccountGroupDataTableModule config={config} />;
}

