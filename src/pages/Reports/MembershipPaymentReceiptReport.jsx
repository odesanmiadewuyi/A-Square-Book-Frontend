import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useDate, useMoney } from '@/settings';
import { selectCompanySettings } from '@/redux/settings/selectors';

const infoCard = {
  background: '#f8fafc',
  padding: 10,
  borderRadius: 8,
};

export default function MembershipPaymentReceiptReport({ id, onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const company = useSelector(selectCompanySettings);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await request.read({ entity: 'membershippayment', id });
        const data = resp?.result || resp?.data || resp;
        if (mounted) setRecord(data || null);
      } catch (err) {
        if (mounted) setError('Unable to load membership payment receipt.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!loading && typeof onReady === 'function') onReady();
  }, [loading, onReady]);

  const companyName = company?.company_name || company?.companyName || company?.name || 'IDURAR CRM/ERP';
  const companyAddress = company?.address || company?.company_address || company?.address_line || '';
  const companyEmail = company?.email || '';
  const companyPhone = company?.phone || '';

  if (loading) {
    return (
      <div style={{ height: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (error) return <div style={{ padding: 16, color: '#b91c1c' }}>{error}</div>;
  if (!record) return <div style={{ padding: 16 }}>Receipt not found.</div>;

  const amount = parseFloat(record.amount || 0) || 0;
  const currency = (record.currency || 'NGN').toString().toUpperCase();
  const bankLabel =
    record?.bankName ||
    record?.bank?.name ||
    (record?.bank?.accountNumber
      ? `${record?.bank?.name || ''} ${record?.bank?.accountNumber || ''}`.trim()
      : '');

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{companyName}</div>
          {companyAddress && <div style={{ fontSize: 12, color: '#64748b' }}>{companyAddress}</div>}
          {(companyEmail || companyPhone) && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{[companyEmail, companyPhone].filter(Boolean).join(' | ')}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Membership Payment Receipt</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{record.referenceNumber || record._id}</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {record.payDate ? dayjs(record.payDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Member ID</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{record.name || '-'}</div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Bank</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{bankLabel || '-'}</div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Amount</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount, currency_code: currency })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Reference Number</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{record.referenceNumber || '-'}</div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Category</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{record.categoryName || record?.category?.name || '-'}</div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Teller Number</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{record.tellerNumber || '-'}</div>
        </div>
      </div>

      {record.description ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Description
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{record.description}</div>
        </div>
      ) : null}
    </div>
  );
}

