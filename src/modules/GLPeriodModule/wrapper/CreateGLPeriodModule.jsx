import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLPeriodForm from '../Forms/GLPeriodForm';

export default function CreateGLPeriodModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={GLPeriodForm} />
    </ErpLayout>
  );
}

