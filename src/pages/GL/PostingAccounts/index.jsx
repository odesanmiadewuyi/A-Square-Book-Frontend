import useLanguage from '@/locale/useLanguage';
import { PostingAccountDataTableModule } from '@/modules/PostingAccountModule';

export default function PostingAccounts(){
  const translate = useLanguage();
  const entity = 'postingaccount';
  const deleteModalLabels = ['name','subgroupcode'];
  const Labels = {
    PANEL_TITLE: 'Posting Accounts',
    DATATABLE_TITLE: 'Posting Accounts',
    ADD_NEW_ENTITY: 'Add New Posting Account',
    ENTITY_NAME: 'postingaccount',
  };
  const config = { entity, ...Labels, deleteModalLabels };
  return <PostingAccountDataTableModule config={config} />;
}

