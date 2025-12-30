import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useDate, useMoney } from '@/settings';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function BankTransferListReport({ onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await request.list({
          entity: 'gljournal',
          options: { page: 1, items: 500, sortBy: 'date', sortValue: -1, filter: 'source', equal: 'BT' },
        });
        const list = Array.isArray(resp?.result)
          ? resp.result
          : Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp?.items)
              ? resp.items
              : [];
        if (mounted) setRows(list);
      } catch (err) {
        if (mounted) setError('Unable to load bank transfer list.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && typeof onReady === 'function') {
      onReady();
    }
  }, [loading, onReady]);

  if (loading) {
    return (
      <div style={{ height: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 16, color: '#b91c1c' }}>{error}</div>;
  }

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 10 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
        Bank Transfer List
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.9fr 1fr 1.8fr 0.8fr 0.7fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Date</div>
          <div style={tableCell}>Journal No</div>
          <div style={tableCell}>Description</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Amount</div>
          <div style={tableCell}>Status</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No transfers found.</div>
        ) : (
          rows.map((row) => {
            const amount = Number(row?.totalDebit || row?.totalCredit || 0);
            const currency = row?.currency || 'NGN';
            return (
              <div
                key={row._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '0.9fr 1fr 1.8fr 0.8fr 0.7fr',
                  background: '#fff',
                }}
              >
                <div style={tableCell}>
                  {row?.date ? dayjs(row.date).format(dateFormat) : '-'}
                </div>
                <div style={tableCell}>{row?.number || '-'}</div>
                <div style={tableCell}>{row?.description || '-'}</div>
                <div style={{ ...tableCell, textAlign: 'right' }}>
                  {moneyFormatter({ amount, currency_code: currency })}
                </div>
                <div style={tableCell}>{row?.status || '-'}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
