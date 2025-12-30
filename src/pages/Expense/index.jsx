import useLanguage from '@/locale/useLanguage';
import ExpenseDataTableModule from '@/modules/ExpenseModule/ExpenseDataTableModule';

export default function Expense() {
  const translate = useLanguage();
  const entity = 'expense';
  const Labels = {
    PANEL_TITLE: translate('expense_list'),
    DATATABLE_TITLE: translate('expense_list'),
    ADD_NEW_ENTITY: translate('add_new_expense'),
    ENTITY_NAME: translate('expenses'),
  };
  const config = { entity, ...Labels };
  return <ExpenseDataTableModule config={config} />;
}

