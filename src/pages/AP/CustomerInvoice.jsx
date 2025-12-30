import useLanguage from '@/locale/useLanguage';
import CreateCustomerInvoiceModule from '@/modules/APCustomerInvoiceModule/CreateCustomerInvoiceModule';

export default function CustomerInvoiceAP() {
  const entity = 'apcustomerinvoice';
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: 'Customer-Invoice',
    DATATABLE_TITLE: 'Customer-Invoice',
    ADD_NEW_ENTITY: 'Add Customer Invoice',
    ENTITY_NAME: 'apcustomerinvoice',
    RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = { entity, ...Labels, redirectPathAfterCreate: '/ap/customer-invoice', stayOnCreateAfterSave: true };
  return <CreateCustomerInvoiceModule config={configPage} />;
}


