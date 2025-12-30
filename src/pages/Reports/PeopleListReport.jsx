import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { personService } from '@/request/personService';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function PeopleListReport({ onReady }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await personService.getPeople({ page: 1, limit: 500, search: '' });
        if (resp?.success && mounted) {
          setRows(Array.isArray(resp?.data) ? resp.data : []);
        } else if (mounted) {
          setRows([]);
          setError(resp?.message || 'Unable to load people list.');
        }
      } catch (err) {
        if (mounted) setError('Unable to load people list.');
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
        People List
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr 0.9fr 1.2fr 0.7fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Firstname</div>
          <div style={tableCell}>Lastname</div>
          <div style={tableCell}>Company</div>
          <div style={tableCell}>Country</div>
          <div style={tableCell}>Phone</div>
          <div style={tableCell}>Email</div>
          <div style={tableCell}>Status</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No people found.</div>
        ) : (
          rows.map((person) => (
            <div
              key={person._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr 0.9fr 1.2fr 0.7fr',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{person?.firstname || '-'}</div>
              <div style={tableCell}>{person?.lastname || '-'}</div>
              <div style={tableCell}>{person?.company || '-'}</div>
              <div style={tableCell}>{person?.country || '-'}</div>
              <div style={tableCell}>{person?.phone || '-'}</div>
              <div style={tableCell}>{person?.email || '-'}</div>
              <div style={tableCell}>{person?.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
