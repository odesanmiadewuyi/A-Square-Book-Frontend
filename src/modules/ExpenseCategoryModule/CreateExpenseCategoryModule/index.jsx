import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import ExpenseCategoryForm from '../Forms/ExpenseCategoryForm';

export default function CreateExpenseCategoryModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ExpenseCategoryForm} />
    </ErpLayout>
  );
}

