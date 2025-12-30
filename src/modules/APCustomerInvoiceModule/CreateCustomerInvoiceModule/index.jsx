import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import APCustomerInvoiceForm from '@/modules/APCustomerInvoiceModule/Forms/APCustomerInvoiceForm';

export default function CreateCustomerInvoiceModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={APCustomerInvoiceForm} />
    </ErpLayout>
  );
}

