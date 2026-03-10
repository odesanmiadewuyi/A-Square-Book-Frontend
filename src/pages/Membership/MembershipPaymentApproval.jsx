import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';

const resolveStatus = (row) => ((row?.approvalStatus || '').toString().trim() || 'Pending');

export default function MembershipPaymentApproval() {
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [note, setNote] = useState('');

  const isLocalRuntime =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || '');
  const defaultBackend =
    typeof window !== 'undefined'
      ? isLocalRuntime
        ? 'http://localhost:8888'
        : window.location.origin
      : 'http://localhost:8888';
  const rawBackend = (import.meta.env.VITE_BACKEND_SERVER || defaultBackend)
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  const backendRoot = /\/api$/i.test(rawBackend) ? rawBackend.replace(/\/api$/i, '') : rawBackend;
  const toDocumentUrl = (filePath) => {
    const src = (filePath || '').toString().trim();
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    return `${backendRoot}/${src.replace(/^\/+/, '')}`;
  };

  const loadRows = async ({ clearSelection = false } = {}) => {
    setLoading(true);
    try {
      const { success, result } = await request.list({
        entity: 'membershippayment',
        options: { items: 200, sortBy: 'created', sortValue: -1 },
      });

      const list = success && Array.isArray(result) ? result : [];
      setRows(list);

      const pending = list.filter((row) => resolveStatus(row) !== 'Approved');
      if (!pending.length) {
        setSelected(null);
        return;
      }
      if (clearSelection) {
        setSelected(null);
        return;
      }

      const keep = pending.find((row) => row?._id === selected?._id);
      setSelected(keep || pending[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingRows = useMemo(
    () => rows.filter((row) => resolveStatus(row) !== 'Approved'),
    [rows]
  );

  const onApprove = async () => {
    if (!selected?._id) return;
    setApproving(true);
    try {
      const payload = {};
      if (note.trim()) payload.note = note.trim();
      const resp = await request.post({
        entity: `membershippayment/approve/${selected._id}`,
        jsonData: payload,
      });
      if (resp?.success) {
        message.success(resp?.message || 'Membership payment approved');
        setNote('');
        await loadRows({ clearSelection: true });
      } else {
        message.error(resp?.message || 'Approval failed');
      }
    } finally {
      setApproving(false);
    }
  };

  const amount = Number(selected?.amount || 0);
  const status = resolveStatus(selected);
  const docUrl = toDocumentUrl(selected?.tellerDocument);

  const columns = [
    { title: 'Reference Number', dataIndex: 'referenceNumber' },
    { title: 'Member ID', dataIndex: 'name' },
    { title: 'Category', dataIndex: 'categoryName' },
    { title: 'Category Type', dataIndex: 'categoryTypeName' },
    {
      title: 'Pay Date',
      dataIndex: 'payDate',
      render: (v) => (v ? dayjs(v).format(dateFormat) : ''),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right',
      render: (v) => moneyFormatter({ amount: Number(v || 0), currency_code: 'NGN' }),
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      render: (_, row) =>
        resolveStatus(row) === 'Approved' ? <Tag color="green">Approved</Tag> : <Tag color="orange">Pending</Tag>,
    },
  ];

  return (
    <ErpLayout>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(420px, 2fr) minmax(320px, 1fr)' }}>
        <Card
          title="Membership-Payment Approval Queue"
          size="small"
          extra={
            <Button size="small" onClick={loadRows} loading={loading}>
              Refresh
            </Button>
          }
          styles={{ body: { padding: 12 } }}
        >
          <Table
            rowKey={(row) => row?._id}
            loading={loading}
            size="small"
            dataSource={pendingRows}
            columns={columns}
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => setSelected(record),
            })}
          />
        </Card>

        <Card title="Approval Detail" size="small" styles={{ body: { padding: 12 } }}>
          {selected ? (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected?.referenceNumber || '-'}</div>
                  <div style={{ color: '#667085', fontSize: 12 }}>
                    {selected?.payDate ? dayjs(selected.payDate).format(dateFormat) : ''}
                  </div>
                </div>
                {status === 'Approved' ? <Tag color="green">Approved</Tag> : <Tag color="orange">Pending</Tag>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Member ID</div>
                  <div style={{ fontWeight: 600 }}>{selected?.name || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Teller Number</div>
                  <div style={{ fontWeight: 600 }}>{selected?.tellerNumber || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Category</div>
                  <div style={{ fontWeight: 600 }}>{selected?.categoryName || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Category Type</div>
                  <div style={{ fontWeight: 600 }}>{selected?.categoryTypeName || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Bank</div>
                  <div style={{ fontWeight: 600 }}>{selected?.bankName || '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#667085', fontSize: 12 }}>Amount</div>
                  <div style={{ fontWeight: 700 }}>
                    {moneyFormatter({ amount: Number.isFinite(amount) ? amount : 0, currency_code: 'NGN' })}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ color: '#667085', fontSize: 12, marginBottom: 4 }}>Description</div>
                <Typography.Text>{selected?.description || '-'}</Typography.Text>
              </div>

              {docUrl ? (
                <Button
                  type="link"
                  style={{ paddingLeft: 0 }}
                  onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
                >
                  View Teller Document
                </Button>
              ) : null}

              <Input.TextArea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional approval note"
                disabled={status === 'Approved'}
              />

              <Button type="primary" onClick={onApprove} loading={approving} disabled={status === 'Approved'} block>
                {status === 'Approved' ? 'Already Approved' : 'Approve Payment'}
              </Button>
            </Space>
          ) : (
            <Typography.Text type="secondary">No payment selected.</Typography.Text>
          )}
        </Card>
      </div>
    </ErpLayout>
  );
}
