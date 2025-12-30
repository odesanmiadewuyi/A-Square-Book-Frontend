import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Form, Space, Table, Tag, Typography, message } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { Title, Text } = Typography;

export default function JournalApproval() {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [selectedId, setSelectedId] = useState();
  const [header, setHeader] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchJournal = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { success, data, result } = await request.read({ entity: 'gljournal', id });
      const rec = data || result;
      if (success && rec) {
        setHeader(rec);
        const resp = await request.filter({
          entity: 'gljournalline',
          options: { filter: 'journal', equal: rec._id },
        });
        const arr = Array.isArray(resp?.result) ? resp.result : resp?.data || [];
        setLines(arr.sort((a, b) => (a.lineNo || 0) - (b.lineNo || 0)));
      } else {
        setHeader(null);
        setLines([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) fetchJournal(selectedId);
  }, [selectedId]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, l) => ({
        debit: acc.debit + (Number(l.debit || 0) || 0),
        credit: acc.credit + (Number(l.credit || 0) || 0),
      }),
      { debit: 0, credit: 0 }
    );
  }, [lines]);

  const approve = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const resp = await request.post({ entity: `gljournal/approve/${selectedId}`, jsonData: {} });
      if (resp?.success) {
        message.success(resp?.message || 'Journal posted');
        // Clear selection and refresh dropdown so posted journal disappears
        setSelectedId(undefined);
        setHeader(null);
        setLines([]);
        form.resetFields();
        setRefreshKey((k) => k + 1);
      } else {
        message.error(resp?.message || 'Approval failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Line #', dataIndex: 'lineNo', key: 'lineNo', width: 80 },
    { title: 'Posting Code', dataIndex: 'accountCode', key: 'accountCode' },
    { title: 'Particular', dataIndex: 'particular', key: 'particular' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Debit', dataIndex: 'debit', key: 'debit', align: 'right', render: (v) => Number(v || 0).toFixed(2) },
    { title: 'Credit', dataIndex: 'credit', key: 'credit', align: 'right', render: (v) => Number(v || 0).toFixed(2) },
  ];

  const formatPeriod = (p) => {
    if (!p) return '';
    if (typeof p === 'string') return p;
    if (typeof p === 'number') return p.toString();
    if (p.name) return p.name;
    const fy = p.fiscalYear ?? p.fy;
    const m = p.month;
    if (fy && m) return `${fy}-${String(m).padStart(2, '0')}`;
    return p._id || '';
  };

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      if (!isNaN(dt)) return dt.toISOString().split('T')[0];
    } catch (_) {}
    return '';
  };

  return (
    <ErpLayout>
      <Title level={4}>Journal Approval</Title>
      <Card>
        <Form layout="vertical" form={form}>
          <Form.Item label="Journal Reference" required>
            <SelectAsync
              key={refreshKey}
              entity="gljournal"
              displayLabels={['number', 'description']}
              outputValue="_id"
              placeholder="Select draft journal"
              listOptions={{ filter: 'status', equal: 'draft', items: 50, sortBy: 'createdAt', sortValue: -1 }}
              onChange={(val) => setSelectedId(val)}
              remoteSearch
              size="middle"
            />
          </Form.Item>
        </Form>

        {header && (
          <Card size="small" style={{ marginTop: 12 }}>
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="Number">{header.number}</Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(header.date)}
              </Descriptions.Item>
              <Descriptions.Item label="Period">{formatPeriod(header?.period)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={header.status === 'posted' ? 'green' : 'blue'}>{header.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {header.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card size="small" title="Lines" style={{ marginTop: 12 }}>
          <Table
            size="small"
            columns={columns}
            dataSource={lines.map((l) => ({ ...l, key: l._id || l.lineNo }))}
            pagination={false}
            loading={loading}
            footer={() => (
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Text strong>Debit: {totals.debit.toFixed(2)}</Text>
                <Text strong>Credit: {totals.credit.toFixed(2)}</Text>
              </Space>
            )}
          />
        </Card>

        <Space style={{ marginTop: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={() => selectedId && fetchJournal(selectedId)} disabled={!selectedId} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={approve}
            disabled={!selectedId || header?.status === 'posted'}
            loading={loading}
          >
            Approve & Post
          </Button>
          {header?.status === 'posted' && <Text type="success">Already posted</Text>}
        </Space>
      </Card>
    </ErpLayout>
  );
}
