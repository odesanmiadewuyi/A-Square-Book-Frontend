import useLanguage from '@/locale/useLanguage';
import GLSettingsModule from '@/modules/SettingModule/GLSettingsModule';

export default function GLSettings() {
  const translate = useLanguage();
  const entity = 'setting';
  const Labels = {
    PANEL_TITLE: translate('settings'),
    DATATABLE_TITLE: translate('settings_list'),
    ADD_NEW_ENTITY: translate('add_new_settings'),
    ENTITY_NAME: translate('settings'),
    SETTINGS_TITLE: 'GL Settings',
  };
  const configPage = { entity, settingsCategory: 'gl_settings', ...Labels };
  return <GLSettingsModule config={configPage} />;
}

