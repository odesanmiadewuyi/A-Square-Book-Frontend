import useLanguage from '@/locale/useLanguage';
import { GLAccountClassDataTableModule } from '@/modules/GLAccountClassModule';

export default function GLAccountClasses(){
  const translate = useLanguage();
  const entity = 'glaccountclass';
  // Labels to display in the delete confirmation modal
  const deleteModalLabels = ['name', 'code'];
  const Labels = {
    PANEL_TITLE: 'Account Classes',
    DATATABLE_TITLE: 'Account Classes',
    ADD_NEW_ENTITY: 'Add New Account Class',
    ENTITY_NAME: 'glaccountclass',
  };
  const config = { entity, ...Labels, deleteModalLabels };
  return <GLAccountClassDataTableModule config={config} />;
}
