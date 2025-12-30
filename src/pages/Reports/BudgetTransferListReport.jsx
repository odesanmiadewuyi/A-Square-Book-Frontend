import { useEffect, useState } from 'react';
import { Spin } from 'antd';

import { request } from '@/request';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function BudgetTransferListReport({ onReady }) {
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
          entity: 'budgettransfer',
          options: { page: 1, items: 500, sortBy: 'createdAt', sortValue: -1 },
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
        if (mounted) setError('Unable to load budget transfers.');
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
        Budget Transfers
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.8fr 0.8fr 0.8fr 1fr 0.7fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Version</div>
          <div style={tableCell}>From (GL)</div>
          <div style={tableCell}>To (GL)</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Amount</div>
          <div style={tableCell}>Note</div>
          <div style={tableCell}>Status</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No transfers found.</div>
        ) : (
          rows.map((transfer) => (
            <div
              key={transfer._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 0.8fr 0.8fr 0.8fr 1fr 0.7fr',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{transfer?.versionId?.code || '-'}</div>
              <div style={tableCell}>{transfer?.fromLineId?.glAccount || '-'}</div>
              <div style={tableCell}>{transfer?.toLineId?.glAccount || '-'}</div>
              <div style={{ ...tableCell, textAlign: 'right' }}>
                {Number(transfer?.amount || 0).toFixed(2)}
              </div>
              <div style={tableCell}>{transfer?.note || '-'}</div>
              <div style={tableCell}>{transfer?.status || '-'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
