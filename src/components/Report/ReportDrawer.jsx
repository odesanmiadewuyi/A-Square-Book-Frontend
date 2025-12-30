import { Drawer } from 'antd';
import ReportFrame from './ReportFrame';

export default function ReportDrawer({ open, onClose, path, params }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="90vw"
      styles={{ body: { padding: 0, background: '#f5f5f5' } }}
      destroyOnClose
    >
      <ReportFrame path={path} params={params} height="88vh" />
    </Drawer>
  );
}
