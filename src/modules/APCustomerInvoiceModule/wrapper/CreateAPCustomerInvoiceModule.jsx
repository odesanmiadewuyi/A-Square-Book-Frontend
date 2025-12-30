import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import APCustomerInvoiceForm from '../Forms/APCustomerInvoiceForm';

export default function CreateAPCustomerInvoiceModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={APCustomerInvoiceForm} />
    </ErpLayout>
  );
}

