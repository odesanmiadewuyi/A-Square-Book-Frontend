import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import LeadOfferForm from '@/modules/LeadOfferModule/Forms/LeadOfferForm';

export default function CreateLeadOfferModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={LeadOfferForm} />
    </ErpLayout>
  );
}
