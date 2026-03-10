import { useEffect, useMemo, useState } from 'react';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useDate, useMoney } from '@/settings';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

const normalizeRef = (value) => (value || '').toString().trim().toUpperCase();
const absAmount = (value) => Math.abs(parseFloat(value || 0)) || 0;

const groupReceiptRows = (list = []) => {
  const groups = new Map();
  list.forEach((row) => {
    if (!row?._id) return;
    const ref = (row?.sourceNumber || '').toString().trim();
    const key = normalizeRef(ref) || row._id.toString();
    if (!groups.has(key)) {
      groups.set(key, {
        ...row,
        sourceNumber: ref || row._id,
        amount: 0,
        groupCount: 0,
        approvalStatusSet: new Set(),
      });
    }
    const group = groups.get(key);
    group.amount += absAmount(row?.amount);
    group.groupCount += 1;
    group.approvalStatusSet.add((row?.approvalStatus || '').toString().trim() || '-');
    if (row?.docDate && (!group.docDate || new Date(row.docDate) < new Date(group.docDate))) {
      group.docDate = row.docDate;
    }
  });
  return Array.from(groups.values())
    .map((group) => {
      const statuses = Array.from(group.approvalStatusSet);
      const approvalStatus = statuses.length === 1 ? statuses[0] : 'Mixed';
      return {
        ...group,
        approvalStatus,
      };
    })
    .sort((a, b) => {
      const da = a?.docDate ? new Date(a.docDate).getTime() : 0;
      const db = b?.docDate ? new Date(b.docDate).getTime() : 0;
      return db - da;
    });
};

export default function ARReceiptListReport({ onReady }) {
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
          entity: 'ar/receipt',
          options: { page: 1, items: 500, sortBy: 'docDate', sortValue: -1 },
        });
        const list = Array.isArray(resp?.result)
          ? resp.result
          : Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp?.items)
              ? resp.items
              : [];
        if (mounted) setRows(groupReceiptRows(list));
      } catch (err) {
        if (mounted) setError('Unable to load receipt list.');
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

  const formatCustomer = useMemo(
    () => (receipt) => {
      const customer = receipt?.customer || {};
      if (receipt?.customerModel === 'Person') {
        const fullName = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
        return fullName || '-';
      }
      return customer.name || '-';
    },
    []
  );

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
        Receipt List
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 1.1fr 1.2fr 1fr 0.8fr 0.8fr',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Date</div>
          <div style={tableCell}>Reference</div>
          <div style={tableCell}>Customer</div>
          <div style={tableCell}>Bank</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Amount</div>
          <div style={tableCell}>Approval</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No receipts found.</div>
        ) : (
          rows.map((receipt) => {
            const amount = absAmount(receipt?.amount || 0);
            const currency = receipt?.currency || 'NGN';
            const bankLabel = receipt?.bank
              ? `${receipt.bank.name || ''} ${receipt.bank.accountNumber || ''}`.trim()
              : '';
            const docDate = receipt?.docDate || receipt?.date;
            return (
              <div
                key={receipt._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1.1fr 1.2fr 1fr 0.8fr 0.8fr',
                  background: '#fff',
                }}
              >
                <div style={tableCell}>{docDate ? dayjs(docDate).format(dateFormat) : '-'}</div>
                <div style={tableCell}>{receipt?.sourceNumber || '-'}</div>
                <div style={tableCell}>{formatCustomer(receipt)}</div>
                <div style={tableCell}>{bankLabel || '-'}</div>
                <div style={{ ...tableCell, textAlign: 'right' }}>
                  {moneyFormatter({ amount, currency_code: currency })}
                </div>
                <div style={tableCell}>{receipt?.approvalStatus || '-'}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
