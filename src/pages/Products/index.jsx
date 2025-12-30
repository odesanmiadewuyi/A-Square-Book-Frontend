import useLanguage from '@/locale/useLanguage';
import ProductDataTableModule from '@/modules/ProductModule/ProductDataTableModule';

export default function Products() {
  const translate = useLanguage();

  const entity = 'product';
  const Labels = {
    PANEL_TITLE: translate('products'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const config = {
    entity,
    ...Labels,
    dataTableColumns: undefined,
  };

  return <ProductDataTableModule config={config} />;
}

