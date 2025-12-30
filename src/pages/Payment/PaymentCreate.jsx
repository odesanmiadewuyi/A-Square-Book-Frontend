import React from 'react';
import useLanguage from '@/locale/useLanguage';
import CreatePaymentModule from '@/modules/PaymentModule/CreatePaymentModule';

export default function PaymentCreate() {
  const translate = useLanguage();

  // We reuse the Record Payment UI but expose it as a standalone Create flow
  const config = {
    entity: 'invoice',
    PANEL_TITLE: translate('payment') || 'Payment',
    DATATABLE_TITLE: translate('record_payment') || 'Record Payment',
    ADD_NEW_ENTITY: translate('record_payment') || 'Record Payment',
    ENTITY_NAME: translate('invoice') || 'Invoice',
  };

  return <CreatePaymentModule config={config} />;
}

