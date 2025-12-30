import { useEffect, useState } from 'react';
import { Spin } from 'antd';

import { request } from '@/request';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function BudgetVersionListReport({ onReady }) {
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
          entity: 'budgetversion',
          options: { page: 1, items: 500, sortBy: 'code', sortValue: 1 },
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
        if (mounted) setError('Unable to load budget versions.');
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
        Budget Versions
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 0.6fr 0.8fr 0.8fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Code</div>
          <div style={tableCell}>Name</div>
          <div style={tableCell}>Year</div>
          <div style={tableCell}>Type</div>
          <div style={tableCell}>Status</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No versions found.</div>
        ) : (
          rows.map((version) => (
            <div
              key={version._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 0.6fr 0.8fr 0.8fr',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{version?.code || '-'}</div>
              <div style={tableCell}>{version?.name || '-'}</div>
              <div style={tableCell}>{version?.fiscalYear || '-'}</div>
              <div style={tableCell}>{version?.type || '-'}</div>
              <div style={tableCell}>{version?.status || '-'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
