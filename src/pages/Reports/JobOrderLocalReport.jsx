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

export default function JobOrderLocalReport({ id, onReady }) {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const company = useSelector(selectCompanySettings);
  const [loading, setLoading] = useState(true);
  const [jobOrder, setJobOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await request.read({ entity: 'joborder', id });
        const data = resp?.result || resp?.data || resp;
        if (mounted) setJobOrder(data);
      } catch (err) {
        if (mounted) setError('Unable to load job order report data.');
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
    if (!jobOrder) return null;
    const qty = Number(jobOrder.qty || 0);
    const unitPrice = Number(jobOrder.unitPrice || 0);
    const base = round2(qty * unitPrice);
    const vatRate = Number(jobOrder.vatRate || 0);
    const retentionRate = Number(jobOrder.retentionRate || 0);
    const whtRate = Number(jobOrder.whtRate || 0);
    const stampRate = Number(jobOrder.stampDutyRate || 0);
    const vat = round2(base * vatRate);
    const retention = round2(base * retentionRate);
    const wht = round2(base * whtRate);
    const stamp = round2(base * stampRate);
    const total = round2(base + vat - wht - stamp - retention);
    return {
      qty,
      unitPrice,
      base,
      vat,
      retention,
      wht,
      stamp,
      total,
    };
  }, [jobOrder]);

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

  if (!jobOrder || !summary) {
    return <div style={{ padding: 16 }}>Job Order not found.</div>;
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
  const currency = jobOrder?.currency || 'NGN';
  const vendorName = jobOrder?.vendorId?.name || '-';
  const voucher = jobOrder?.joNo || jobOrder?._id;
  const prNo = jobOrder?.prId?.prNo || '-';
  const budgetLine = jobOrder?.budgetLineId?.glAccount || '-';

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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Job Order Voucher</div>
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
          <div style={{ fontSize: 11, color: '#64748b' }}>PR No</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{prNo}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Start Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {jobOrder?.startDate ? dayjs(jobOrder.startDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Due Date</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {jobOrder?.dueDate ? dayjs(jobOrder.dueDate).format(dateFormat) : '-'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Budget Line</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{budgetLine}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Currency</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currency}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Status</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{jobOrder?.status || '-'}</div>
        </div>
      </div>

      {jobOrder?.scope && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Scope/SoW
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{jobOrder.scope}</div>
        </div>
      )}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 140px 140px',
            background: '#f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={tableCell}>Description</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Qty</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Unit Price</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>Total</div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 140px 140px',
            background: '#fff',
          }}
        >
          <div style={tableCell}>{jobOrder?.scope || '-'}</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>{summary.qty}</div>
          <div style={{ ...tableCell, textAlign: 'right' }}>
            {moneyFormatter({ amount: summary.unitPrice, currency_code: currency })}
          </div>
          <div style={{ ...tableCell, textAlign: 'right' }}>
            {moneyFormatter({ amount: summary.base, currency_code: currency })}
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
            {moneyFormatter({ amount: summary.base, currency_code: currency })}
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
            {moneyFormatter({ amount: summary.total, currency_code: currency })}
          </div>
        </div>
      </div>
    </div>
  );
}
