import useLanguage from '@/locale/useLanguage';
import GLAccountSubGroupDataTableModule from '@/modules/GLAccountSubGroupModule/GLAccountSubGroupDataTableModule';

export default function GLAccountSubGroups(){
  const translate = useLanguage();
  const entity = 'glaccountsubgroup';
  const deleteModalLabels = ['name','subgroupcode'];
  const Labels = {
    PANEL_TITLE: 'Account Sub-Groups',
    DATATABLE_TITLE: 'Account Sub-Groups',
    ADD_NEW_ENTITY: 'Add New Account Sub-Group',
    ENTITY_NAME: 'glaccountsubgroup',
  };
  const config = { entity, ...Labels, deleteModalLabels };
  return <GLAccountSubGroupDataTableModule config={config} />;
}

