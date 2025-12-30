import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import GLJournalForm from '../Forms/GLJournalForm';

export default function CreateGLJournalModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={GLJournalForm} />
    </ErpLayout>
  );
}

