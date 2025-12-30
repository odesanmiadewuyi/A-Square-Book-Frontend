import useLanguage from '@/locale/useLanguage';
import { ReadProductModule } from '@/modules/ProductModule';

export default function ProductRead() {
  const translate = useLanguage();
  const entity = 'product';
  const Labels = {
    PANEL_TITLE: translate('products'),
    DATATABLE_TITLE: translate('products'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };
  const config = { entity, ...Labels };
  return <ReadProductModule config={config} />;
}

