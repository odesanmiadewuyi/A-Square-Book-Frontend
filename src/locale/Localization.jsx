import { ConfigProvider, App as AntdApp } from 'antd';
import AntdAppBridge from '@/shared/AntdAppBridge';

export default function Localization({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#339393',
          colorLink: '#1640D6',
          borderRadius: 0,
        },
      }}
    >
      <AntdApp>
        <AntdAppBridge />
        {children}
      </AntdApp>
    </ConfigProvider>
  );
}
