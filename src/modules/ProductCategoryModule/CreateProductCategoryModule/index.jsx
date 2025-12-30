import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import ProductCategoryForm from '../Forms/ProductCategoryForm';

export default function CreateProductCategoryModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ProductCategoryForm} />
    </ErpLayout>
  );
}

