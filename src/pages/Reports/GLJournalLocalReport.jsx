import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useDate, useMoney } from '@/settings';
import { selectCompanySettings } from '@/redux/settings/selectors';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function GLJournalLocalReport({ id, onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const company = useSelector(selectCompanySettings);
  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState(null);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [journalResp, linesResp] = await Promise.all([
          request.read({ entity: 'gljournal', id }),
          request.filter({ entity: 'gljournalline', options: { filter: 'journal', equal: id } }),
        ]);
        const journalData = journalResp?.result || journalResp?.data || journalResp;
        const lineData = Array.isArray(linesResp?.result) ? linesResp.result : [];
        if (mounted) {
          setJournal(journalData);
          setLines(
            lineData
              .map((line) => ({
                ...line,
                debit: Number(line?.debit) || 0,
                credit: Number(line?.credit) || 0,
              }))
              .sort((a, b) => (a?.lineNo || 0) - (b?.lineNo || 0))
          );
        }
      } catch (err) {
        if (mounted) setError('Unable to load journal report data.');
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
    if (!loading && typeof onReady === 'function') {
      onReady();
    }
  }, [loading, onReady]);

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const credit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.0001 };
  }, [lines]);

  const companyName =
    company?.company_name ||
    company?.companyName ||
    company?.name ||
    'A Square Book';
  const companyAddress =
    company?.address ||
    company?.company_address ||
    company?.address_line ||
    '';
  const companyEmail = company?.email || '';
  const companyPhone = company?.phone || '';
  const currency = journal?.currency || 'NGN';
  const formatPeriod = (period) => {
    if (!period) return '-';
    if (typeof period === 'string' || typeof period === 'number') return String(period);
    if (typeof period === 'object') {
      const year = period.fiscalYear || period.year || '';
      const month = period.month || '';
      const name = period.name || period.code || '';
      const start = period.startDate ? dayjs(period.startDate).format(dateFormat) : '';
      const end = period.endDate ? dayjs(period.endDate).format(dateFormat) : '';
      if (name) return name;
      if (month && year) return `${month} ${year}`;
      if (start || end) return [start, end].filter(Boolean).join(' - ');
      return [month, year].filter(Boolean).join(' ') || '-';
    }
    return '-';
  };

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

  if (!journal) {
    return <div style={{ padding: 16 }}>Journal not found.</div>;
  }

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{companyName}</div>
          {companyAddress && <div style={{ fontSize: 12, color: '#64748b' }}>{companyAddress}</div>}
          {(companyEmail || companyPhone) && (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {[companyEmail, companyPhone].filter(Boolean).join(' | ')}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Journal Voucher</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{journal?.number || journal?._id}</div>
          <div
            style={{
              marginTop: 6,
              padding: '2px 8px',
              borderRadius: 999,
              background: totals.balanced ? '#dcfce7' : '#fee2e2',
              color: totals.balanced ? '#166534' : '#991b1b',
              fontSize: 11,
              display: 'inline-block',
            }}
          >
            {totals.balanced ? 'Balanced' : 'Not Balanced'}
          </div>
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
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {journal?.date ? dayjs(journal.date).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Period</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formatPeriod(journal?.period)}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Status</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{journal?.status || 'draft'}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Currency</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currency}</div>
        </div>
      </div>

      {journal?.description && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Description
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{journal.description}</div>
        </div>
      )}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 120px 120px',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Posting Code</div>
          <div style={tableCell}>Particular</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Debit</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Credit</div>
        </div>
        {lines.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No lines found.</div>
        ) : (
          lines.map((line) => (
            <div
              key={line._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 120px 120px',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{line.accountCode || '-'}</div>
              <div style={tableCell}>{line.particular || line.description || '-'}</div>
              <div style={{ ...tableCell, textAlign: 'right' }}>
                {moneyFormatter({ amount: line.debit || 0, currency_code: currency })}
              </div>
              <div style={{ ...tableCell, textAlign: 'right' }}>
                {moneyFormatter({ amount: line.credit || 0, currency_code: currency })}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 20,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <div>
          Total Debit: {moneyFormatter({ amount: totals.debit, currency_code: currency })}
        </div>
        <div>
          Total Credit: {moneyFormatter({ amount: totals.credit, currency_code: currency })}
        </div>
      </div>
    </div>
  );
}

