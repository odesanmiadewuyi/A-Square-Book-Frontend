import { useState } from 'react';
import { Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import ReportDrawer from './ReportDrawer';

export default function ReportButton({ path, params, label = 'View Report', size = 'small' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} icon={<FileTextOutlined />} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ReportDrawer open={open} onClose={() => setOpen(false)} path={path} params={params} />
    </>
  );
}
