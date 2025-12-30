import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import { useDate, useMoney } from '@/settings';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { formatVoucherNumber } from '@/utils/helpers';

const tableCell = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 12,
};

export default function APCustomerInvoiceLocalReport({ id, onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const company = useSelector(selectCompanySettings);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await request.read({ entity: 'apcustomerinvoice', id });
        const data = resp?.result || resp?.data || resp;
        if (mounted) setInvoice(data);
      } catch (err) {
        if (mounted) setError('Unable to load customer invoice data.');
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

  const items = useMemo(() => {
    if (!invoice) return [];
    if (Array.isArray(invoice.items)) return invoice.items;
    if (Array.isArray(invoice.invoice?.items)) return invoice.invoice.items;
    return [];
  }, [invoice]);

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

  if (!invoice) {
    return <div style={{ padding: 16 }}>Customer invoice not found.</div>;
  }

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
  const currency = invoice?.currency || 'NGN';
  const clientName = invoice?.client?.name || invoice?.client?.companyName || '-';
  const voucher =
    invoice?.voucherNumber ||
    invoice?.displayNumber ||
    (invoice?.number ? formatVoucherNumber(invoice.number, 'INV-') : '') ||
    invoice?._id;

  const subTotal = Number(invoice?.subTotal || 0) || 0;
  const taxTotal = Number(invoice?.taxTotal || 0) || 0;
  const total = Number(invoice?.total || 0) || 0;

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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
            Customer Invoice
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{voucher}</div>
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
          <div style={{ fontSize: 11, color: '#64748b' }}>Client</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{clientName}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {invoice?.date ? dayjs(invoice.date).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Due Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {invoice?.expiredDate ? dayjs(invoice.expiredDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Currency</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currency}</div>
        </div>
      </div>

      {invoice?.notes && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Note
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{invoice.notes}</div>
        </div>
      )}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 90px 120px 120px',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Posting Code</div>
          <div style={tableCell}>Description</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Qty</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Price</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Total</div>
        </div>
        {items.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12, color: '#64748b' }}>No items found.</div>
        ) : (
          items.map((line, idx) => (
            <div
              key={line._id || `${line.itemName}-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 90px 120px 120px',
                background: '#fff',
              }}
            >
              <div style={tableCell}>{line.itemName || '-'}</div>
              <div style={tableCell}>{line.description || '-'}</div>
              <div style={{ ...tableCell, textAlign: 'right' }}>{line.quantity || 0}</div>
              <div style={{ ...tableCell, textAlign: 'right' }}>
                {moneyFormatter({ amount: line.price || 0, currency_code: currency })}
              </div>
              <div style={{ ...tableCell, textAlign: 'right' }}>
                {moneyFormatter({ amount: line.total || 0, currency_code: currency })}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
          justifyContent: 'flex-end',
        }}
      >
        <div />
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Sub Total</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: subTotal, currency_code: currency })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Tax Total</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: taxTotal, currency_code: currency })}
          </div>
        </div>
        <div />
        <div />
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {moneyFormatter({ amount: total, currency_code: currency })}
          </div>
        </div>
      </div>
    </div>
  );
}
