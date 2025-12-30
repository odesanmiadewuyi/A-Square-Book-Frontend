import useLanguage from '@/locale/useLanguage';
import RecordPaymentModule from '@/modules/InvoiceModule/RecordPaymentModule';

export default function PaymentRecord() {
  const translate = useLanguage();
  const entity = 'invoice';
  const Labels = {
    PANEL_TITLE: translate('payment') || 'Payment',
    DATATABLE_TITLE: translate('record_payment') || 'Record Payment',
    ADD_NEW_ENTITY: translate('record_payment') || 'Record Payment',
    ENTITY_NAME: translate('invoice') || 'invoice',
  };
  const configPage = { entity, ...Labels };
  return <RecordPaymentModule config={configPage} />;
}

