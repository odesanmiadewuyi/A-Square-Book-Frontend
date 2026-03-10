import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Input, Typography, Tag } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';

const normalizeRef = (value) => (value || '').toString().trim().toUpperCase();
const absAmount = (value) => Math.abs(parseFloat(value || 0)) || 0;

const buildPendingGroups = (list = []) => {
  const groups = new Map();
  list.forEach((row) => {
    if (!row?._id) return;
    const ref = (row?.sourceNumber || '').toString().trim();
    const refKey = normalizeRef(ref);
    const fallbackKey = row?._id?.toString?.() || '';
    const key = refKey || fallbackKey;
    if (!groups.has(key)) {
      groups.set(key, {
        groupKey: key,
        _id: row._id,
        sourceNumber: ref || row._id,
        docDate: row.docDate,
        customer: row.customer,
        customerModel: row.customerModel,
        currency: row.currency || 'NGN',
        controlAccountCode: row.controlAccountCode || '',
        bank: row.bank,
        approvalStatus: row.approvalStatus || 'Pending',
        description: row.description || row.notes || '',
        amount: 0,
        recordIds: [],
        entriesCount: 0,
      });
    }
    const group = groups.get(key);
    group.amount += absAmount(row?.amount);
    group.recordIds.push(row._id);
    if (!group.description && (row?.description || row?.notes)) {
      group.description = row.description || row.notes || '';
    }
    if (row?.docDate && (!group.docDate || new Date(row.docDate) < new Date(group.docDate))) {
      group.docDate = row.docDate;
    }
    const rowEntries = Array.isArray(row?.entries) && row.entries.length ? row.entries : null;
    group.entriesCount += rowEntries ? rowEntries.length : 1;
  });
  return Array.from(groups.values()).sort((a, b) => {
    const da = a?.docDate ? new Date(a.docDate).getTime() : 0;
    const db = b?.docDate ? new Date(b.docDate).getTime() : 0;
    return db - da;
  });
};

export default function ARReceiptApproval() {
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const { result } = await request.list({ entity: 'ar/receipt', options: { items: 100, approvalStatus: 'Pending' } });
      const list = Array.isArray(result) ? result : [];
      const grouped = buildPendingGroups(list);
      setRows(grouped);
      if (grouped.length) {
        const keep = grouped.find((r) => r?.groupKey === selected?.groupKey);
        setSelected(keep || grouped[0]);
      } else {
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApprove = async (record) => {
    const ids = Array.isArray(record?.recordIds) && record.recordIds.length
      ? record.recordIds
      : (record?._id ? [record._id] : []);
    if (!ids.length) return;
    setApproving(true);
    try {
      const payload = {};
      if (note) payload.note = note;
      let successCount = 0;
      const failed = [];
      for (const id of ids) {
        const resp = await request.post({ entity: `ar/receipt/approve/${id}`, jsonData: payload });
        if (resp?.success) successCount += 1;
        else failed.push(resp?.message || `Failed to approve ${id}`);
      }
      if (successCount === ids.length) {
        message.success(ids.length > 1 ? 'Receipt group approved' : 'Receipt approved');
        setNote('');
        await loadPending();
      } else {
        message.error(failed[0] || 'Approval failed');
        await loadPending();
      }
    } finally {
      setApproving(false);
    }
  };

  const columns = [
    { title: 'Date', dataIndex: 'docDate', render: (v) => (v ? dayjs(v).format(dateFormat) : '') },
    { title: 'Reference No', dataIndex: 'sourceNumber' },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      render: (_, r) => {
        const cm = r?.customerModel;
        const c = r?.customer || {};
        if (cm === 'Person') return `${c.firstname || ''} ${c.lastname || ''}`.trim();
        return c.name || '';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right',
      render: (v, r) =>
        moneyFormatter({ amount: absAmount(v), currency_code: r?.currency || 'NGN' }),
    },
    { title: 'AR Control', dataIndex: 'controlAccountCode' },
    { title: 'Bank', dataIndex: ['bank', 'name'], render: (_, r) => r?.bank?.name || '' },
  ];

  const selectedAmount = absAmount(selected?.amount || 0);
  const arControl = selected?.controlAccountCode || '';
  const bankPosting = selected?.bank?.postingAccountCode || selected?.bank?.postingcode || '';
  const bankName = selected?.bank?.name || '';

  const previewLines = selected
    ? [
        { key: 'dr', side: 'Debit', account: bankPosting || 'Bank', amount: selectedAmount, note: bankName ? `Bank: ${bankName}` : '' },
        { key: 'cr', side: 'Credit', account: arControl || 'AR Control', amount: selectedAmount, note: selected?.description || '' },
      ]
    : [];

  return (
    <ErpLayout>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(360px, 2fr) minmax(320px, 1fr)' }}>
        <Card
          title="Pending AR Receipts"
          extra={
            <Space>
              <Button size="small" onClick={loadPending} loading={loading}>
                Reload
              </Button>
            </Space>
          }
          size="small"
          styles={{ body: { padding: 12 } }}
        >
          <Table
            size="small"
            loading={loading}
            rowKey={(row) => row?.groupKey || row?._id}
            dataSource={rows}
            columns={columns}
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => setSelected(record),
            })}
          />
        </Card>

        <Card title="AR Receipt Approval" size="small" styles={{ body: { padding: 12 } }}>
          {selected ? (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected?.sourceNumber || 'No Reference'}</div>
                  <div style={{ color: '#667085', fontSize: 12 }}>
                    {selected?.docDate ? dayjs(selected.docDate).format(dateFormat) : ''}
                    {selected?.entriesCount ? ` | ${selected.entriesCount} entr${selected.entriesCount > 1 ? 'ies' : 'y'}` : ''}
                  </div>
                </div>
                <Tag color="orange">Pending</Tag>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Customer</div>
                  <div style={{ fontWeight: 600 }}>
                    {selected?.customerModel === 'Person'
                      ? `${selected?.customer?.firstname || ''} ${selected?.customer?.lastname || ''}`.trim()
                      : selected?.customer?.name || ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#667085', fontSize: 12 }}>Amount</div>
                  <div style={{ fontWeight: 700 }}>
                    {moneyFormatter({ amount: selectedAmount, currency_code: selected?.currency || 'NGN' })}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#667085', fontSize: 12 }}>Bank</div>
                  <div style={{ fontWeight: 600 }}>{bankName || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#667085', fontSize: 12 }}>AR Control</div>
                  <div style={{ fontWeight: 600 }}>{arControl || '—'}</div>
                </div>
              </div>
              <div style={{ background: '#fafafa', padding: 10, borderRadius: 8 }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                  GL Preview
                </Typography.Text>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={previewLines}
                  rowKey={(r) => r.key}
                  columns={[
                    { title: 'Posting Code', dataIndex: 'account', key: 'account' },
                    { title: 'Side', dataIndex: 'side', key: 'side', width: 80 },
                    {
                      title: 'Amount',
                      dataIndex: 'amount',
                      key: 'amount',
                      align: 'right',
                      render: (v) => moneyFormatter({ amount: v || 0, currency_code: selected?.currency || 'NGN' }),
                    },
                    { title: 'Note', dataIndex: 'note', key: 'note' },
                  ]}
                />
              </div>
              <Input.TextArea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional approval note"
              />
              <Button type="primary" onClick={() => onApprove(selected)} loading={approving} block>
                Approve Receipt
              </Button>
            </Space>
          ) : (
            <Typography.Text type="secondary">No pending receipts to approve.</Typography.Text>
          )}
        </Card>
      </div>
    </ErpLayout>
  );
}
