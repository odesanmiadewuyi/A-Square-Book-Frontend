import { useEffect, useMemo, useState } from 'react';
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

const normalizeRef = (value) => (value || '').toString().trim().toUpperCase();
const absAmount = (value) => Math.abs(parseFloat(value || 0)) || 0;

const toEntryRows = (receipt = {}) => {
  if (Array.isArray(receipt.entries) && receipt.entries.length) {
    return receipt.entries.map((entry, index) => ({
      ...entry,
      _lineKey: `${receipt._id || 'receipt'}-${entry?._id || entry?.lineNo || index + 1}`,
      amount: absAmount(entry?.amount || 0),
      date: entry?.date || receipt.docDate,
      description: (entry?.description || '').toString(),
      arControl: (entry?.arControl || receipt.controlAccountCode || '').toString(),
      referenceNo: (entry?.referenceNo || receipt.sourceNumber || '').toString(),
    }));
  }
  return [
    {
      _lineKey: `${receipt._id || 'receipt'}-1`,
      lineNo: 1,
      date: receipt.docDate,
      description: receipt.description || receipt.notes || '',
      amount: absAmount(receipt.amount || 0),
      arControl: receipt.controlAccountCode || '',
      referenceNo: receipt.sourceNumber || '',
    },
  ];
};

export default function ARReceiptLocalReport({ id, onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const company = useSelector(selectCompanySettings);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await request.read({ entity: 'ar/receipt', id });
        const base = resp?.result || resp?.data || resp;
        if (!base) {
          if (mounted) setReceipt(null);
          return;
        }

        let merged = base;
        const hasEntries = Array.isArray(base?.entries) && base.entries.length > 0;
        const refText = (base?.sourceNumber || '').toString().trim();
        const refKey = normalizeRef(refText);
        // Only merge by reference for legacy rows that do not carry entry lines.
        if (!hasEntries && refKey) {
          try {
            const listResp = await request.list({
              entity: 'ar/receipt',
              options: { page: 1, items: 1000, ref: refText },
            });
            const candidateRows = Array.isArray(listResp?.result)
              ? listResp.result
              : Array.isArray(listResp?.data)
                ? listResp.data
                : Array.isArray(listResp?.items)
                  ? listResp.items
                  : [];
            const sameReference = candidateRows.filter(
              (row) => normalizeRef(row?.sourceNumber) === refKey
            );
            if (sameReference.length > 1) {
              const totalAmount = sameReference.reduce((sum, row) => sum + absAmount(row?.amount), 0);
              const mergedEntries = sameReference.flatMap((row) => toEntryRows(row));
              merged = {
                ...base,
                amount: totalAmount,
                entries: mergedEntries,
                description:
                  base.description ||
                  (sameReference.length > 1 ? `AR Receipt (${mergedEntries.length} entries)` : ''),
              };
            }
          } catch (_) {
            // Keep base receipt if related list lookup fails.
          }
        }

        if (mounted) setReceipt(merged || null);
      } catch (err) {
        if (mounted) setError('Unable to load receipt data.');
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

  const customerName = useMemo(() => {
    if (!receipt?.customer) return '';
    if (receipt.customerModel === 'Person') {
      return `${receipt.customer.firstname || ''} ${receipt.customer.lastname || ''}`.trim();
    }
    return receipt.customer.name || '';
  }, [receipt]);

  const companyName =
    company?.company_name ||
    company?.companyName ||
    company?.name ||
    'IDURAR CRM/ERP';
  const companyAddress =
    company?.address ||
    company?.company_address ||
    company?.address_line ||
    '';
  const companyEmail = company?.email || '';
  const companyPhone = company?.phone || '';

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

  if (!receipt) {
    return <div style={{ padding: 16 }}>Receipt not found.</div>;
  }

  const entryRows = toEntryRows(receipt);
  const amountFromEntries = entryRows.reduce((sum, entry) => sum + absAmount(entry?.amount || 0), 0);
  const amount = amountFromEntries || absAmount(receipt.amount || 0);
  const currency = receipt.currency || 'NGN';
  const bankLabel = receipt.bank
    ? `${receipt.bank.name || ''} ${receipt.bank.accountNumber || ''}`.trim()
    : '';

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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Receipt Voucher</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{receipt.sourceNumber || receipt._id}</div>
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
            {receipt.docDate ? dayjs(receipt.docDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Customer</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{customerName || '-'}</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>AR Control Posting Code</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{receipt.controlAccountCode || '-'}</div>
        </div>
        <div style={infoCard}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Reference</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{receipt.sourceNumber || '-'}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Entry Details
        </div>
        <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1.7fr 1fr 0.8fr',
              background: '#f8fafc',
              fontSize: 11,
              fontWeight: 600,
              color: '#475569',
            }}
          >
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>Date</div>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>Description</div>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>AR Control</div>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Amount</div>
          </div>
          {entryRows.map((entry, index) => {
            const lineAmount = absAmount(entry?.amount || 0);
            const lineDate = entry?.date || receipt.docDate;
            return (
              <div
                key={entry?._lineKey || `${entry?._id || entry?.lineNo || 'line'}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1.7fr 1fr 0.8fr',
                  fontSize: 12,
                  background: '#fff',
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>
                  {lineDate ? dayjs(lineDate).format(dateFormat) : '-'}
                </div>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>
                  {entry?.description || '-'}
                </div>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>
                  {entry?.arControl || receipt.controlAccountCode || '-'}
                </div>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                  {moneyFormatter({ amount: lineAmount, currency_code: currency })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {receipt.description && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Transaction Description
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{receipt.description}</div>
        </div>
      )}
    </div>
  );
}
