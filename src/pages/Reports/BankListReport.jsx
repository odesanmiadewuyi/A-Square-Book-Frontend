import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { request } from '@/request';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function BankListReport({ onReady }) {
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
          entity: 'bank',
          options: { page: 1, items: 500, sortBy: 'name', sortValue: 1 },
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
        if (mounted) setError('Unable to load bank list.');
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
        Bank List
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 0.7fr 1fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Name</div>
          <div style={tableCell}>Code</div>
          <div style={tableCell}>Account Name</div>
          <div style={tableCell}>Account Number</div>
          <div style={tableCell}>Currency</div>
          <div style={tableCell}>Posting Code</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No banks found.</div>
        ) : (
          rows.map((bank) => (
            <div
              key={bank._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 0.7fr 1fr',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{bank?.name || '-'}</div>
              <div style={tableCell}>{bank?.code || '-'}</div>
              <div style={tableCell}>{bank?.accountName || '-'}</div>
              <div style={tableCell}>{bank?.accountNumber || '-'}</div>
              <div style={tableCell}>{bank?.currency || '-'}</div>
              <div style={tableCell}>{bank?.postingAccountCode || '-'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
