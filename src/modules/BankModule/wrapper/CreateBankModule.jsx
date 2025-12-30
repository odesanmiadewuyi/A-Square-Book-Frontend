import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import BankForm from '../Forms/BankForm';

export default function CreateBankModule({ config }){
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={BankForm} />
    </ErpLayout>
  );
}

