import { useEffect, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import { request } from '@/request';
import { useDate, useMoney } from '@/settings';

const { RangePicker } = DatePicker;

const normalizeList = (resp) => {
  if (Array.isArray(resp?.result)) return resp.result;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp)) return resp;
  return [];
};

export default function MembershipLedgerReport() {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [memberId, setMemberId] = useState();
  const [referenceQuery, setReferenceQuery] = useState('');
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const listAllResp = await request.listAll({
        entity: 'membershipledger',
        options: { sort: 'desc' },
      });
      let list = normalizeList(listAllResp);
      if (!list.length) {
        const listResp = await request.list({
          entity: 'membershipledger',
          options: { page: 1, items: 500, sortBy: 'createdAt', sortValue: -1 },
        });
        list = normalizeList(listResp);
      }
      setRows(Array.isArray(list) ? list : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const memberOptions = useMemo(() => {
    const unique = new Map();
    (rows || []).forEach((row) => {
      const value =
        row?.payment?.name ||
        row?.payment?.memberId ||
        row?.memberId ||
        '';
      const clean = value.toString().trim();
      if (clean && !unique.has(clean)) unique.set(clean, clean);
    });
    return Array.from(unique.values()).map((value) => ({ label: value, value }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const from = range?.[0] ? dayjs(range[0]).startOf('day') : null;
    const to = range?.[1] ? dayjs(range[1]).endOf('day') : null;
    const ref = (referenceQuery || '').toString().trim().toLowerCase();
    return (rows || []).filter((row) => {
      const rowMember = (
        row?.payment?.name ||
        row?.payment?.memberId ||
        row?.memberId ||
        ''
      )
        .toString()
        .trim();
      if (memberId && rowMember !== memberId) return false;

      const rowReference = (row?.referenceNumber || '').toString().toLowerCase();
      if (ref && !rowReference.includes(ref)) return false;

      const rowDate = dayjs(row?.date || row?.createdAt || null);
      if (from && rowDate.isValid() && rowDate.isBefore(from)) return false;
      if (to && rowDate.isValid() && rowDate.isAfter(to)) return false;

      return true;
    });
  }, [rows, memberId, referenceQuery, range]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.debit += Number(row?.debit || 0);
        acc.credit += Number(row?.credit || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [filteredRows]);

  return (
    <ErpLayout>
      <style>
        {`@media print {
          .membership-ledger__controls { display: none !important; }
          .membership-ledger__header-actions { display: none !important; }
          .membership-ledger__shell { box-shadow: none !important; border: none !important; }
          .membership-ledger__page { padding: 0 !important; background: #fff !important; }
          .membership-ledger__body { padding: 0 !important; background: #fff !important; }
          .membership-ledger__panel { padding: 16px !important; }
          .ant-layout-sider, .navigation { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
        }
        .membership-ledger__page {
          padding: 20px;
          background: #f5f5f5;
        }
        .membership-ledger__shell {
          max-width: 1200px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          border: 1px solid #e6edf3;
          overflow: hidden;
        }
        .membership-ledger__header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid #eef2f6;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        }
        .membership-ledger__title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          text-align: center;
        }
        .membership-ledger__header-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .membership-ledger__body {
          padding: 12px;
          background: #f8fafc;
        }
        .membership-ledger__panel {
          background: #fff;
          padding: 24px;
          border-radius: 10px;
        }
        .membership-ledger__section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .membership-ledger__meta {
          margin: 6px 0 12px;
          color: #475569;
          font-size: 12px;
        }
        .membership-ledger__controls label {
          font-size: 12px;
          color: #475569;
        }
        .membership-ledger__table {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .membership-ledger__table-row,
        .membership-ledger__table-head {
          display: grid;
          grid-template-columns: 0.9fr 1.2fr 0.8fr 0.7fr 1fr 0.8fr 0.8fr 1.6fr;
        }
        .membership-ledger__table-head {
          background: #f1f5f9;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }
        .membership-ledger__table-cell {
          padding: 8px 10px;
          font-size: 12px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .membership-ledger__table-total {
          font-weight: 600;
          background: #fff;
        }
        .membership-ledger__empty {
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }
        `}
      </style>
      <div className="membership-ledger__page">
        <div className="membership-ledger__shell">
          <div className="membership-ledger__header">
            <div />
            <div className="membership-ledger__title">MEMBERSHIP LEDGER REPORT</div>
            <div className="membership-ledger__header-actions">
              <Button size="small" onClick={fetchLedger} loading={loading}>
                View Ledger
              </Button>
              <Button size="small" onClick={() => window.print()} disabled={loading}>
                Print Ledger
              </Button>
            </div>
          </div>
          <div className="membership-ledger__body">
            <div className="membership-ledger__panel">
              <div className="membership-ledger__section-title">Membership Ledger</div>

              <Row gutter={[12, 12]} align="bottom" className="membership-ledger__controls">
                <Col xs={24} md={7}>
                  <label>Member ID</label>
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select member"
                    value={memberId}
                    onChange={setMemberId}
                    optionFilterProp="label"
                    options={memberOptions}
                    filterOption={(input, option) =>
                      (option?.label || '').toString().toLowerCase().includes((input || '').toLowerCase())
                    }
                  />
                </Col>
                <Col xs={24} md={7}>
                  <label>Reference Number</label>
                  <Input
                    allowClear
                    placeholder="Search reference"
                    value={referenceQuery}
                    onChange={(e) => setReferenceQuery(e.target.value)}
                  />
                </Col>
                <Col xs={24} md={7}>
                  <label>Date Range</label>
                  <RangePicker
                    value={range}
                    onChange={(value) => setRange(value || [])}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} md={3}>
                  <Button block onClick={() => {
                    setMemberId(undefined);
                    setReferenceQuery('');
                    setRange([dayjs().startOf('month'), dayjs().endOf('month')]);
                  }}>
                    Clear
                  </Button>
                </Col>
              </Row>

              <div className="membership-ledger__meta">
                Showing <strong>{filteredRows.length}</strong> entries
              </div>

              <div className="membership-ledger__table">
                <div className="membership-ledger__table-head">
                  <div className="membership-ledger__table-cell">Date</div>
                  <div className="membership-ledger__table-cell">Reference</div>
                  <div className="membership-ledger__table-cell">Member ID</div>
                  <div className="membership-ledger__table-cell">Leg</div>
                  <div className="membership-ledger__table-cell">Posting Code</div>
                  <div className="membership-ledger__table-cell">Debit</div>
                  <div className="membership-ledger__table-cell">Credit</div>
                  <div className="membership-ledger__table-cell">Description</div>
                </div>
                {loading ? (
                  <div className="membership-ledger__empty">Loading...</div>
                ) : filteredRows.length === 0 ? (
                  <div className="membership-ledger__empty">No ledger rows found.</div>
                ) : (
                  filteredRows.map((row) => (
                    <div className="membership-ledger__table-row" key={row._id}>
                      <div className="membership-ledger__table-cell">
                        {row?.date ? dayjs(row.date).format(dateFormat) : '-'}
                      </div>
                      <div className="membership-ledger__table-cell">{row?.referenceNumber || '-'}</div>
                      <div className="membership-ledger__table-cell">
                        {row?.payment?.name || row?.payment?.memberId || row?.memberId || '-'}
                      </div>
                      <div className="membership-ledger__table-cell">{row?.leg || '-'}</div>
                      <div className="membership-ledger__table-cell">{row?.postingcode || '-'}</div>
                      <div className="membership-ledger__table-cell">
                        {moneyFormatter({ amount: Number(row?.debit || 0), currency_code: row?.currency || 'NGN' })}
                      </div>
                      <div className="membership-ledger__table-cell">
                        {moneyFormatter({ amount: Number(row?.credit || 0), currency_code: row?.currency || 'NGN' })}
                      </div>
                      <div className="membership-ledger__table-cell">{row?.description || '-'}</div>
                    </div>
                  ))
                )}
                <div className="membership-ledger__table-row membership-ledger__table-total">
                  <div className="membership-ledger__table-cell">Total</div>
                  <div className="membership-ledger__table-cell" />
                  <div className="membership-ledger__table-cell" />
                  <div className="membership-ledger__table-cell" />
                  <div className="membership-ledger__table-cell" />
                  <div className="membership-ledger__table-cell">
                    {moneyFormatter({ amount: totals.debit, currency_code: 'NGN' })}
                  </div>
                  <div className="membership-ledger__table-cell">
                    {moneyFormatter({ amount: totals.credit, currency_code: 'NGN' })}
                  </div>
                  <div className="membership-ledger__table-cell" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}

