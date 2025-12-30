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

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export default function InvoiceJOLocalReport({ id, onReady }) {
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
        const resp = await request.read({ entity: 'invoicejo', id });
        const data = resp?.result || resp?.data || resp;
        if (mounted) setInvoice(data);
      } catch (err) {
        if (mounted) setError('Unable to load invoice JO report data.');
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

  const summary = useMemo(() => {
    if (!invoice) return null;
    const net = Number(invoice.netAmount || 0);
    const vat = Number(invoice.vatAmount || 0);
    const gross = Number(invoice.grossAmount || 0);
    const wht = round2(net * (Number(invoice.whtRate || 0) / 100));
    const stamp = round2(net * (Number(invoice.stampRate || 0) / 100));
    const retention = round2(net * (Number(invoice.retentionRate || 0) / 100));
    return { net, vat, gross, wht, stamp, retention };
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

  if (!invoice || !summary) {
    return <div style={{ padding: 16 }}>Invoice JO not found.</div>;
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
  const currency = invoice?.joId?.currency || 'NGN';
  const vendorName = invoice?.vendorId?.name || '-';
  const voucher = invoice?.invoiceNo || invoice?._id;
  const joNo = invoice?.joId?.joNo || '-';
  const budgetLine = invoice?.budgetLineId?.glAccount || '-';
  const description = invoice?.joId?.scope || 'Invoice JO';
  const qty = Number(invoice?.joId?.qty || 0) || 0;
  const unitPrice = Number(invoice?.joId?.unitPrice || 0) || 0;

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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Invoice JO Voucher</div>
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
          <div style={{ fontSize: 11, color: '#64748b' }}>Vendor</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{vendorName}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Invoice Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {invoice?.invoiceDate ? dayjs(invoice.invoiceDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Job Order</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{joNo}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Currency</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currency}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Budget Line</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{budgetLine}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Status</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{invoice?.status || '-'}</div>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 90px 120px 120px',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Budget Line</div>
          <div style={tableCell}>Description</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Qty</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Price</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Total</div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 90px 120px 120px',
            background: '#fff',
          }}
        >
          <div style={tableCell}>{budgetLine}</div>
          <div style={tableCell}>{description}</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>{qty}</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>
            {moneyFormatter({ amount: unitPrice, currency_code: currency })}
          </div>
          <div style={{ ...tableCell, textAlign: 'right' }}>
            {moneyFormatter({ amount: summary.net, currency_code: currency })}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        <div />
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Sub Total</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: summary.net, currency_code: currency })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>VAT</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: summary.vat, currency_code: currency })}
          </div>
        </div>
        <div />
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Retention</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: summary.retention, currency_code: currency })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>WHT</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: summary.wht, currency_code: currency })}
          </div>
        </div>
        <div />
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Stamp Duty</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {moneyFormatter({ amount: summary.stamp, currency_code: currency })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {moneyFormatter({ amount: summary.gross, currency_code: currency })}
          </div>
        </div>
      </div>
    </div>
  );
}
