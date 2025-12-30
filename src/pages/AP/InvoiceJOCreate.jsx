import useLanguage from '@/locale/useLanguage';
import CreateInvoiceJOModule from '@/modules/InvoiceJOModule/wrapper/CreateInvoiceJOModule';

export default function InvoiceJOCreate() {
  const translate = useLanguage();
  const entity = 'invoicejo';
  const Labels = {
    PANEL_TITLE: 'Invoice (Job Orders)',
    DATATABLE_TITLE: 'Invoice JO',
    ADD_NEW_ENTITY: 'Add Invoice',
    ENTITY_NAME: 'InvoiceJO',
  };
  // After create, go back to the list instead of Approve page
  const config = {
    entity,
    ...Labels,
    pathPrefix: 'ap/invoicejo',
    redirectAfterCreate: 'list',
    stayOnCreateAfterSave: true,
  };
  return <CreateInvoiceJOModule config={config} />;
}


