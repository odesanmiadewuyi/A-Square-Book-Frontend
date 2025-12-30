import BankDataTableModule from '@/modules/BankModule/BankDataTableModule';

export default function BankPage(){
  const config = {
    entity: 'bank',
    PANEL_TITLE: 'Banks',
    DATATABLE_TITLE: 'Banks',
    ADD_NEW_ENTITY: 'Add New Bank',
    ENTITY_NAME: 'bank',
    redirectAfterCreate: 'list',
  };
  return <BankDataTableModule config={config} />;
}

