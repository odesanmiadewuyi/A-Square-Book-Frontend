import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import SettingsForm from './settingsForm';
import useLanguage from '@/locale/useLanguage';

export default function GLSettingsModule({ config }) {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection title={'General Ledger Settings'} description={'Configure GL behaviors'}>
        <SettingsForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}

