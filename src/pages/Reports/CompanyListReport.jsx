import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { companyService } from '@/request/companyService';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function CompanyListReport({ onReady }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await companyService.getCompanies({ page: 1, limit: 500, search: '' });
        if (resp?.success && mounted) {
          setRows(Array.isArray(resp?.data) ? resp.data : []);
        } else if (mounted) {
          setRows([]);
          setError(resp?.message || 'Unable to load company list.');
        }
      } catch (err) {
        if (mounted) setError('Unable to load company list.');
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
        Company List
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.1fr 0.8fr 0.9fr 1.2fr 1.2fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Name</div>
          <div style={tableCell}>Contact</div>
          <div style={tableCell}>Country</div>
          <div style={tableCell}>Phone</div>
          <div style={tableCell}>Email</div>
          <div style={tableCell}>Website</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No companies found.</div>
        ) : (
          rows.map((company) => {
            const contact = company?.contact || {};
            const contactName = [contact.firstname, contact.lastname].filter(Boolean).join(' ');
            return (
              <div
                key={company._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.1fr 0.8fr 0.9fr 1.2fr 1.2fr',
                  background: '#fff',
                }}
              >
                <div style={tableCell}>{company?.name || '-'}</div>
                <div style={tableCell}>{contactName || contact?.email || '-'}</div>
                <div style={tableCell}>{company?.country || '-'}</div>
                <div style={tableCell}>{company?.phone || '-'}</div>
                <div style={tableCell}>{company?.email || '-'}</div>
                <div style={tableCell}>{company?.website || '-'}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
