import useLanguage from '@/locale/useLanguage';
import { CreateLeadOfferModule } from '@/modules/LeadOfferModule';

export default function LeadOfferCreate() {
  const translate = useLanguage();

  const entity = 'lead-offers';

  const Labels = {
    PANEL_TITLE: translate('offers_for_leads'),
    DATATABLE_TITLE: translate('offers_for_leads'),
    ADD_NEW_ENTITY: translate('add_new_offer_for_lead'),
    ENTITY_NAME: translate('offer_leads'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  return <CreateLeadOfferModule config={configPage} />;
}
