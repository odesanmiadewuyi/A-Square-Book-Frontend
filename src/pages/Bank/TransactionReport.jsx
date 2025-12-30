import { useEffect, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Row, Select, message } from 'antd';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import { request } from '@/request';
import { useDate, useMoney } from '@/settings';

const { RangePicker } = DatePicker;

const toQuery = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

export default function BankTransactionReport() {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const [bankId, setBankId] = useState();
  const [banks, setBanks] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [reportBankId, setReportBankId] = useState();
  const [reportRange, setReportRange] = useState(range);
  const [reportKey, setReportKey] = useState('');
  const [pendingPrint, setPendingPrint] = useState('');

  const resolveBankId = (override) => (override === undefined ? bankId : override);
  const resolveRange = (override) => (override === undefined ? range : override);

  const buildReportKey = (value, rangeValue) => {
    const fromKey = rangeValue?.[0] ? rangeValue[0].format('YYYY-MM-DD') : '';
    const toKey = rangeValue?.[1] ? rangeValue[1].format('YYYY-MM-DD') : '';
    return `${value || 'all'}|${fromKey}|${toKey}`;
  };

  const fetchReport = async ({ bankIdOverride, rangeOverride, triggerPrint = false } = {}) => {
    setLoading(true);
    try {
      const nextBankId = resolveBankId(bankIdOverride);
      const nextRange = resolveRange(rangeOverride);
      const nextKey = buildReportKey(nextBankId, nextRange);
      const from = nextRange?.[0] ? nextRange[0].format('YYYY-MM-DD') : '';
      const to = nextRange?.[1] ? nextRange[1].format('YYYY-MM-DD') : '';
      const query = toQuery({ bankId: nextBankId || undefined, from, to });
      const resp = await request.get({
        entity: `banktransaction/report${query ? `?${query}` : ''}`,
      });
      const result = resp?.result || {};
      const list = Array.isArray(result?.rows) ? result.rows : [];
      setRows(list);
      setTotals({
        debit: Number(result?.totals?.debit || 0),
        credit: Number(result?.totals?.credit || 0),
      });
      setReportBankId(nextBankId || null);
      setReportRange(nextRange || []);
      setReportKey(nextKey);
      if (triggerPrint) {
        setPendingPrint(nextKey);
      }
    } catch {
      setRows([]);
      setTotals({ debit: 0, credit: 0 });
      setReportBankId(null);
      setReportKey('');
      setPendingPrint('');
    } finally {
      setLoading(false);
    }
  };

  const normalizeList = (resp) => {
    const list = Array.isArray(resp?.result)
      ? resp.result
      : Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.items)
            ? resp.items
            : [];
    return Array.isArray(list) ? list : [];
  };

  const fetchBanks = async () => {
    setBankLoading(true);
    try {
      const respAll = await request.listAll({
        entity: 'bank',
        options: { sort: 'asc' },
      });
      let list = normalizeList(respAll);
      if (!list.length) {
        const respList = await request.list({
          entity: 'bank',
          options: { page: 1, items: 200, sortBy: 'name', sortValue: 1 },
        });
        list = normalizeList(respList);
      }
      setBanks(list);
    } catch {
      setBanks([]);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchReport();
  }, []);

  const tableRows = useMemo(
    () =>
      (rows || []).map((row) => ({
        key: row._id,
        date: row?.date ? dayjs(row.date).format(dateFormat) : '-',
        number: row?.number || '-',
        description: row?.description || '-',
        postingCode: row?.postingcode || '-',
        accountNo: row?.accountno || '-',
        debit: moneyFormatter({
          amount: Number(row?.Debit || 0),
          currency_code: row?.currency || 'NGN',
        }),
        credit: moneyFormatter({
          amount: Number(row?.Credit || 0),
          currency_code: row?.currency || 'NGN',
        }),
        status: row?.status || '-',
      })),
    [rows, dateFormat, moneyFormatter]
  );

  const selectedBankLabel = useMemo(() => {
    if (!reportBankId) return 'All Banks';
    const bank = (banks || []).find((b) => b._id === reportBankId);
    if (!bank) return 'Selected Bank';
    return `${bank.name || 'Bank'}${bank.accountNumber ? ` (${bank.accountNumber})` : ''}`;
  }, [banks, reportBankId]);

  const handlePrintByBank = () => {
    if (!bankId) {
      message.warning('Select a bank to print by bank.');
      return;
    }
    fetchReport({ bankIdOverride: bankId, rangeOverride: range, triggerPrint: true });
  };

  const handlePrintAll = () => {
    fetchReport({ bankIdOverride: null, rangeOverride: range, triggerPrint: true });
  };

  useEffect(() => {
    if (!pendingPrint || loading || pendingPrint !== reportKey) return;
    if (typeof window === 'undefined') {
      setPendingPrint('');
      return;
    }
    let raf1;
    let raf2;
    let timer;
    const trigger = () => {
      window.print();
      setPendingPrint('');
    };
    if (typeof window.requestAnimationFrame !== 'function') {
      timer = setTimeout(trigger, 250);
      return () => clearTimeout(timer);
    }
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        timer = setTimeout(trigger, 250);
      });
    });
    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [pendingPrint, loading, reportKey]);

  return (
    <ErpLayout>
      <style>
        {`@media print {
          .bank-report__controls { display: none !important; }
          .bank-report__header-actions { display: none !important; }
          .bank-report__shell { box-shadow: none !important; border: none !important; }
          .bank-report__page { padding: 0 !important; background: #fff !important; }
          .bank-report__body { padding: 0 !important; background: #fff !important; }
          .bank-report__panel { padding: 16px !important; }
          .ant-layout-sider, .navigation { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
        }
        .bank-report__page {
          padding: 20px;
          background: #f5f5f5;
        }
        .bank-report__shell {
          max-width: 1200px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          border: 1px solid #e6edf3;
          overflow: hidden;
        }
        .bank-report__header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid #eef2f6;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        }
        .bank-report__title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          text-align: center;
        }
        .bank-report__header-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .bank-report__body {
          padding: 12px;
          background: #f8fafc;
        }
        .bank-report__panel {
          background: #fff;
          padding: 24px;
          border-radius: 10px;
        }
        .bank-report__section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .bank-report__meta {
          margin: 6px 0 12px;
          color: #475569;
          font-size: 12px;
        }
        .bank-report__controls label {
          font-size: 12px;
          color: #475569;
        }
        .bank-report__table {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .bank-report__table-row,
        .bank-report__table-head {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr 1.6fr 1fr 1fr 0.8fr 0.8fr 0.8fr;
        }
        .bank-report__table-head {
          background: #f1f5f9;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }
        .bank-report__table-cell {
          padding: 8px 10px;
          font-size: 12px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bank-report__table-total {
          font-weight: 600;
          background: #fff;
        }
        .bank-report__empty {
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }
        `}
      </style>
      <div className="bank-report__page">
        <div className="bank-report__shell">
          <div className="bank-report__header">
            <div />
            <div className="bank-report__title">BANK TRANSACTION Report</div>
            <div className="bank-report__header-actions">
              <Button size="small" onClick={handlePrintByBank}>
                Print By Bank
              </Button>
              <Button size="small" onClick={handlePrintAll}>
                Print All
              </Button>
            </div>
          </div>
          <div className="bank-report__body">
            <div className="bank-report__panel">
              <div className="bank-report__section-title">Bank Transaction List</div>
              <Row gutter={[12, 12]} align="bottom" className="bank-report__controls">
                <Col xs={24} md={10}>
                  <label>Bank</label>
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select bank"
                    loading={bankLoading}
                    onChange={(value) => {
                      setBankId(value);
                      fetchReport({ bankIdOverride: value, rangeOverride: range });
                    }}
                    optionFilterProp="label"
                    options={(banks || []).map((bank) => ({
                      value: bank._id,
                      label: `${bank.name || 'Bank'}${bank.accountNumber ? ` (${bank.accountNumber})` : ''}`,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label || '').toString().toLowerCase().includes((input || '').toLowerCase())
                    }
                  />
                </Col>
                <Col xs={24} md={10}>
                  <label>Date range</label>
                  <RangePicker
                    value={range}
                    onChange={(value) => setRange(value)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} md={4}>
                  <Button type="primary" onClick={() => fetchReport()} block loading={loading}>
                    Run Report
                  </Button>
                </Col>
              </Row>
              <div className="bank-report__meta">
                Bank: <strong>{selectedBankLabel}</strong>
                {reportRange?.[0] && reportRange?.[1]
                  ? ` | Date: ${reportRange[0].format(dateFormat)} - ${reportRange[1].format(dateFormat)}`
                  : ''}
              </div>
              <div className="bank-report__table">
                <div className="bank-report__table-head">
                  <div className="bank-report__table-cell">Date</div>
                  <div className="bank-report__table-cell">Number</div>
                  <div className="bank-report__table-cell">Description</div>
                  <div className="bank-report__table-cell">Posting Code</div>
                  <div className="bank-report__table-cell">Account No</div>
                  <div className="bank-report__table-cell">Debit</div>
                  <div className="bank-report__table-cell">Credit</div>
                  <div className="bank-report__table-cell">Status</div>
                </div>
                {loading ? (
                  <div className="bank-report__empty">Loading...</div>
                ) : tableRows.length === 0 ? (
                  <div className="bank-report__empty">No transactions found.</div>
                ) : (
                  tableRows.map((row) => (
                    <div className="bank-report__table-row" key={row.key}>
                      <div className="bank-report__table-cell">{row.date}</div>
                      <div className="bank-report__table-cell">{row.number}</div>
                      <div className="bank-report__table-cell">{row.description}</div>
                      <div className="bank-report__table-cell">{row.postingCode}</div>
                      <div className="bank-report__table-cell">{row.accountNo}</div>
                      <div className="bank-report__table-cell">{row.debit}</div>
                      <div className="bank-report__table-cell">{row.credit}</div>
                      <div className="bank-report__table-cell">{row.status}</div>
                    </div>
                  ))
                )}
                <div className="bank-report__table-row bank-report__table-total">
                  <div className="bank-report__table-cell">Total</div>
                  <div className="bank-report__table-cell" />
                  <div className="bank-report__table-cell" />
                  <div className="bank-report__table-cell" />
                  <div className="bank-report__table-cell" />
                  <div className="bank-report__table-cell">
                    {moneyFormatter({ amount: totals.debit, currency_code: 'NGN' })}
                  </div>
                  <div className="bank-report__table-cell">
                    {moneyFormatter({ amount: totals.credit, currency_code: 'NGN' })}
                  </div>
                  <div className="bank-report__table-cell" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}
