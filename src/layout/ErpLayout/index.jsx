import { ErpContextProvider } from '@/context/erp';

import { Layout } from 'antd';
import { useSelector } from 'react-redux';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          // Reduce outer spacing so the frame sits higher on the page
          margin: '12px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
          // Override heavy top/bottom padding from `.layoutPadding`
          padding: '16px 24px',
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}
