import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLAccountClassForm from '../Forms/GLAccountClassForm';

export default function CreateGLAccountClassModule({ config }){
  return (
    <ErpLayout>
      <CreateItem
        config={{
          ...config,
          redirectAfterCreate: 'list',
          redirectPathAfterCreate: '/gl/classes',
        }}
        CreateForm={GLAccountClassForm}
      />
    </ErpLayout>
  );
}
