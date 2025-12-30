import { useMemo, useRef } from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { PrinterOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';

/**
 * Generic Report Viewer
 * Props:
 * - open: boolean
 * - onClose: function
 * - title: string
 * - src: URL to the report (PDF/HTML)
 * - onRefresh: optional reload handler
 * - allowPrint: show print button (default true)
 * - width: modal width (default 900)
 * - height: iframe height (default '70vh')
 */
export default function ReportViewer({
  open,
  onClose,
  title = 'Report Viewer',
  src,
  onRefresh,
  allowPrint = true,
  width = 900,
  height = '70vh',
}) {
  const frameRef = useRef(null);
  const frameKey = useMemo(() => `${src || 'blank'}-${open ? 'open' : 'closed'}`, [src, open]);

  const handlePrint = () => {
    try {
      const win = frameRef.current?.contentWindow;
      if (win) {
        win.focus();
        win.print();
      }
    } catch (_) {}
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={width}
      title={title}
      footer={
        <Space>
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {allowPrint && (
            <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint}>
              Print
            </Button>
          )}
          <Button icon={<CloseCircleOutlined />} onClick={onClose}>
            Close
          </Button>
        </Space>
      }
      bodyStyle={{ padding: 0, minHeight: height }}
    >
      {src ? (
        <iframe
          key={frameKey}
          ref={frameRef}
          src={src}
          title={title}
          style={{ border: 0, width: '100%', height }}
        />
      ) : (
        <div style={{ padding: 16 }}>
          <Typography.Text type="secondary">Provide a report URL to display.</Typography.Text>
        </div>
      )}
    </Modal>
  );
}
