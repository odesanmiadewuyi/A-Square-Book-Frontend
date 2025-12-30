import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLAccountGroupForm from '../Forms/GLAccountGroupForm';

export default function CreateGLAccountGroupModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={GLAccountGroupForm} />
    </ErpLayout>
  );
}

