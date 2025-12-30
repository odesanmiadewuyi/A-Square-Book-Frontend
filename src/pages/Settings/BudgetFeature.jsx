import useLanguage from '@/locale/useLanguage';
import BudgetFeatureSettingsModule from '@/modules/SettingModule/BudgetFeatureSettingsModule';

export default function BudgetFeatureSettings() {
  const translate = useLanguage();
  const entity = 'setting';
  const Labels = {
    PANEL_TITLE: translate('settings'),
    DATATABLE_TITLE: translate('settings_list'),
    ADD_NEW_ENTITY: translate('add_new_settings'),
    ENTITY_NAME: translate('settings'),
    SETTINGS_TITLE: 'Budget Feature',
  };
  // Use a dedicated category to keep keys organized
  const configPage = { entity, settingsCategory: 'budget_flags', ...Labels };
  return <BudgetFeatureSettingsModule config={configPage} />;
}

