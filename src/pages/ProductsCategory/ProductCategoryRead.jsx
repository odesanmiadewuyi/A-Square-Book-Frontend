import useLanguage from '@/locale/useLanguage';
import { ReadProductCategoryModule } from '@/modules/ProductCategoryModule';

export default function ProductCategoryRead() {
  const translate = useLanguage();
  const entity = 'productcategory';
  const Labels = {
    PANEL_TITLE: translate('products_category'),
    DATATABLE_TITLE: translate('products_category'),
    ADD_NEW_ENTITY: translate('add_new_product_category'),
    ENTITY_NAME: translate('product_category'),
  };
  const config = { entity, ...Labels };
  return <ReadProductCategoryModule config={config} />;
}

