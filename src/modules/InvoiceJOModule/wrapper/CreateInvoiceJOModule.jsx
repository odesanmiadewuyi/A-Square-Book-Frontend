import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import InvoiceJOForm from '../Forms/InvoiceJOForm';

export default function CreateInvoiceJOModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={InvoiceJOForm} />
    </ErpLayout>
  );
}

