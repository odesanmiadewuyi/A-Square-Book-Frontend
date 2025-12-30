import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import SettingsForm from './settingsForm';
import useLanguage from '@/locale/useLanguage';

export default function BudgetFeatureSettingsModule({ config }) {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection title={'Budget Feature'} description={'Enable or disable budget usage across the app'}>
        <SettingsForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}

