import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLAccountSubGroupForm from '../Forms/GLAccountSubGroupForm';

export default function CreateGLAccountSubGroupModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={GLAccountSubGroupForm} />
    </ErpLayout>
  );
}

