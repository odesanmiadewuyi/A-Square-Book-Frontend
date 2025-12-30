import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLAccountForm from '../Forms/GLAccountForm';

export default function CreateGLAccountModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={GLAccountForm} />
    </ErpLayout>
  );
}

