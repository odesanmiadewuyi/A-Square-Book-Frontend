import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import PostingAccountForm from '../Forms/PostingAccountForm';

export default function CreatePostingAccountModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={PostingAccountForm} />
    </ErpLayout>
  );
}

