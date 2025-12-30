import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import ExpenseForm from '../Forms/ExpenseForm';

export default function CreateExpenseModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ExpenseForm} />
    </ErpLayout>
  );
}

