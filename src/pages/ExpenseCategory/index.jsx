import useLanguage from '@/locale/useLanguage';
import ExpenseCategoryDataTableModule from '@/modules/ExpenseCategoryModule/ExpenseCategoryDataTableModule';

export default function ExpenseCategory() {
  const translate = useLanguage();
  const entity = 'expensecategory';
  const Labels = {
    PANEL_TITLE: translate('expenses_category'),
    DATATABLE_TITLE: translate('expense_category_list'),
    ADD_NEW_ENTITY: translate('add_new_expense_category'),
    ENTITY_NAME: translate('expenses_category'),
  };
  const config = { entity, ...Labels };
  return <ExpenseCategoryDataTableModule config={config} />;
}

