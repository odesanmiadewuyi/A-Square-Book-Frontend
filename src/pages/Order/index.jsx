import useLanguage from '@/locale/useLanguage';
import OrderDataTableModule from '@/modules/OrderModule/OrderDataTableModule';

export default function Order() {
  const translate = useLanguage();
  const entity = 'order';
  const Labels = {
    PANEL_TITLE: translate('order_list'),
    DATATABLE_TITLE: translate('order_list'),
    ADD_NEW_ENTITY: translate('add_new_order'),
    ENTITY_NAME: translate('order'),
  };

  const config = { entity, ...Labels };
  return <OrderDataTableModule config={config} />;
}
