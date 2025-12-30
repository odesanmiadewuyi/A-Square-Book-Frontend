import useLanguage from '@/locale/useLanguage';
import { GLAccountDataTableModule } from '@/modules/GLAccountModule';

export default function GLAccounts(){
  const translate = useLanguage();
  const entity = 'glaccount';
  const deleteModalLabels = ['name','code'];
  const Labels = {
    PANEL_TITLE: 'Chart of Accounts',
    DATATABLE_TITLE: 'Chart of Accounts',
    ADD_NEW_ENTITY: 'Add New GL Account',
    ENTITY_NAME: 'glaccount',
  };
  const config = { entity, ...Labels, deleteModalLabels };
  return <GLAccountDataTableModule config={config} />;
}
