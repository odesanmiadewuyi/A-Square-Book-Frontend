import useLanguage from '@/locale/useLanguage';
import ProductCategoryDataTableModule from '@/modules/ProductCategoryModule/ProductCategoryDataTableModule';

export default function ProductsCategory() {
  const translate = useLanguage();

  const entity = 'productcategory';
  const Labels = {
    PANEL_TITLE: translate('products_category'),
    DATATABLE_TITLE: translate('product_category_list'),
    ADD_NEW_ENTITY: translate('add_new_product_category'),
    ENTITY_NAME: translate('product_category'),
  };

  const config = {
    entity,
    ...Labels,
  };

  return <ProductCategoryDataTableModule config={config} />;
}

