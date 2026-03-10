import { useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';

import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useDate, useMoney } from '@/settings';

const { RangePicker } = DatePicker;

const makeDefaultRange = () => [dayjs().startOf('month'), dayjs().endOf('month')];

export default function GLAccountDetail() {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();

  const [range, setRange] = useState(makeDefaultRange());
  const [postingCode, setPostingCode] = useState('');
  const [postingSelectResetKey, setPostingSelectResetKey] = useState(0);
  const [postingRecord, setPostingRecord] = useState(null);
  const [reportFilters, setReportFilters] = useState(null);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0, net: 0 });
  const [loading, setLoading] = useState(false);

  const from = range?.[0] ? dayjs(range[0]).format('YYYY-MM-DD') : '';
  const to = range?.[1] ? dayjs(range[1]).format('YYYY-MM-DD') : '';

  const fetchLedgerRows = async () => {
    const allRows = [];
    const pageSize = 500;
    let page = 1;
    let totalPages = 1;

    do {
      const options = {
        page,
        items: pageSize,
        sortBy: 'date',
        sortValue: 1,
        inFilter: 'status',
        inEqual: 'posted',
      };
      if (postingCode) {
        options.filter = 'postingcode';
        options.equal = postingCode;
      }

      const response = await request.list({ entity: 'generalledger', options });
      const chunk = Array.isArray(response?.result) ? response.result : [];
      allRows.push(...chunk);

      const nextTotalPages = Number(response?.pagination?.pages || 1);
      totalPages = Number.isFinite(nextTotalPages) && nextTotalPages > 0 ? nextTotalPages : 1;
      page += 1;
    } while (page <= totalPages);

    return allRows;
  };

  const applyPostedOnly = (list = []) =>
    list.filter((row) => (row?.status || '').toString().trim().toLowerCase() === 'posted');

  const applyDateRange = (list = []) => {
    const start = from ? dayjs(from).startOf('day') : null;
    const end = to ? dayjs(to).endOf('day') : null;
    return list.filter((row) => {
      const rowDate = dayjs(row?.date || row?.createdAt || null);
      if (!rowDate.isValid()) return true;
      if (start && rowDate.isBefore(start)) return false;
      if (end && rowDate.isAfter(end)) return false;
      return true;
    });
  };

  const computeTotals = (list = []) =>
    list.reduce(
      (acc, row) => {
        acc.debit += Number(row?.Debit || 0);
        acc.credit += Number(row?.Credit || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );

  const runReport = async () => {
    setLoading(true);
    try {
      const fetchedRows = await fetchLedgerRows();
      const postedRows = applyPostedOnly(fetchedRows);
      const reportRows = applyDateRange(postedRows);
      const baseTotals = computeTotals(reportRows);
      const reportTotals = { ...baseTotals, net: baseTotals.debit - baseTotals.credit };

      setRows(reportRows);
      setTotals(reportTotals);
      setReportFilters({
        from,
        to,
        postingCode: postingCode || '',
        postingLabel: postingCode
          ? `${postingCode}${postingRecord?.name ? ` - ${postingRecord.name}` : ''}`
          : 'All Posting Codes',
      });
    } catch (error) {
      setRows([]);
      setTotals({ debit: 0, credit: 0, net: 0 });
      message.error('Failed to load GL account detail report');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setRange(null);
    setPostingCode('');
    setPostingRecord(null);
    setPostingSelectResetKey((prev) => prev + 1);
    setRows([]);
    setTotals({ debit: 0, credit: 0, net: 0 });
    setReportFilters(null);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 140,
        render: (value) => (value ? dayjs(value).format(dateFormat) : '-'),
      },
      {
        title: 'Number',
        dataIndex: 'number',
        key: 'number',
        width: 170,
        render: (value) => value || '-',
      },
      {
        title: 'Posting Code',
        dataIndex: 'postingcode',
        key: 'postingcode',
        width: 130,
        render: (value) => value || '-',
      },
      {
        title: 'Source',
        dataIndex: 'source',
        key: 'source',
        width: 90,
        render: (value) => value || '-',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (value) => value || '-',
      },
      {
        title: 'Debit',
        dataIndex: 'Debit',
        key: 'Debit',
        width: 150,
        align: 'right',
        render: (value, row) =>
          moneyFormatter({
            amount: Number(value || 0),
            currency_code: row?.currency || 'NGN',
          }),
      },
      {
        title: 'Credit',
        dataIndex: 'Credit',
        key: 'Credit',
        width: 150,
        align: 'right',
        render: (value, row) =>
          moneyFormatter({
            amount: Number(value || 0),
            currency_code: row?.currency || 'NGN',
          }),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (value) => value || '-',
      },
    ],
    [dateFormat, moneyFormatter]
  );

  const handlePrint = () => {
    if (!reportFilters || loading) return;
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <ErpLayout>
      <style>
        {`@media print {
          .gl-account-detail__controls { display: none !important; }
          .gl-account-detail__screen-actions { display: none !important; }
          .gl-account-detail__screen-table { display: none !important; }
          .gl-account-detail__print-wrap { display: block !important; }
          .ant-layout-sider, .navigation { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
          .gl-account-detail__page { padding: 0 !important; }
          .gl-account-detail__report-card { box-shadow: none !important; border: none !important; }
          .gl-account-detail__print-table { width: 100%; border-collapse: collapse; }
          .gl-account-detail__print-table th,
          .gl-account-detail__print-table td {
            border: 1px solid #d9d9d9;
            padding: 6px 8px;
            font-size: 11px;
            vertical-align: top;
          }
          .gl-account-detail__print-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .gl-account-detail__print-meta {
            margin-bottom: 8px;
            font-size: 12px;
          }
          .gl-account-detail__print-total {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            font-size: 12px;
            font-weight: 600;
          }
        }`}
      </style>

      <div className="gl-account-detail__page">
        <Card
          title="GL - Account Detail"
          className="gl-account-detail__controls"
          extra={
            <Space className="gl-account-detail__actions">
              <Button type="primary" onClick={runReport} loading={loading}>
                Display Report
              </Button>
              <Button onClick={clearFilters} disabled={loading}>
                Clear
              </Button>
              <Button onClick={handlePrint} disabled={!reportFilters || loading}>
                Print
              </Button>
            </Space>
          }
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={8}>
              <Typography.Text>Date Range</Typography.Text>
              <RangePicker
                value={range}
                onChange={(value) => setRange(value || [])}
                style={{ width: '100%', marginTop: 6 }}
              />
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Typography.Text>Posting Code</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <SelectAsync
                  key={`posting-code-${postingSelectResetKey}`}
                  entity="postingaccount"
                  outputValue="postingcode"
                  displayLabels={['postingcode', 'name']}
                  placeholder="All Posting Codes"
                  value={postingCode || null}
                  onChange={(value) => {
                    const nextCode = (value || '').toString();
                    setPostingCode(nextCode);
                    if (!nextCode) setPostingRecord(null);
                  }}
                  onSelectRecord={(record) => setPostingRecord(record || null)}
                  listOptions={{ items: 300, sortBy: 'postingcode', sortValue: 1 }}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {reportFilters && (
          <Card
            title="GL - Account Detail Report"
            className="gl-account-detail__report-card"
            style={{ marginTop: 16 }}
            extra={
              <Typography.Text type="secondary" className="gl-account-detail__screen-actions">
                {`Rows: ${rows.length}`}
              </Typography.Text>
            }
          >
            <Typography.Paragraph style={{ marginBottom: 12 }}>
              <strong>Posting Code:</strong> {reportFilters.postingLabel}
              {' | '}
              <strong>Date:</strong>{' '}
              {reportFilters.from && reportFilters.to
                ? `${dayjs(reportFilters.from).format(dateFormat)} - ${dayjs(reportFilters.to).format(dateFormat)}`
                : 'All Dates'}
              {' | '}
              <strong>Status:</strong> Posted
            </Typography.Paragraph>

            <div className="gl-account-detail__screen-table">
              <Table
                rowKey={(row) => row?._id || `${row?.number || ''}-${row?.postingcode || ''}-${row?.date || ''}`}
                columns={columns}
                dataSource={rows}
                loading={loading}
                pagination={{ pageSize: 25, showSizeChanger: true }}
                scroll={{ x: 1200 }}
                footer={() => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, fontWeight: 600 }}>
                    <span>
                      Total Debit:{' '}
                      {moneyFormatter({
                        amount: totals.debit,
                        currency_code: 'NGN',
                      })}
                    </span>
                    <span>
                      Total Credit:{' '}
                      {moneyFormatter({
                        amount: totals.credit,
                        currency_code: 'NGN',
                      })}
                    </span>
                    <span>
                      Net:{' '}
                      {moneyFormatter({
                        amount: totals.net,
                        currency_code: 'NGN',
                      })}
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="gl-account-detail__print-wrap" style={{ display: 'none' }}>
              <div className="gl-account-detail__print-header">
                <strong>GL - Account Detail Report</strong>
                <span>{`Rows: ${rows.length}`}</span>
              </div>
              <div className="gl-account-detail__print-meta">
                <strong>Posting Code:</strong> {reportFilters.postingLabel}
                {' | '}
                <strong>Date:</strong>{' '}
                {reportFilters.from && reportFilters.to
                  ? `${dayjs(reportFilters.from).format(dateFormat)} - ${dayjs(reportFilters.to).format(dateFormat)}`
                  : 'All Dates'}
                {' | '}
                <strong>Status:</strong> Posted
              </div>
              <table className="gl-account-detail__print-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Number</th>
                    <th>Posting Code</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row?._id || `${row?.number || ''}-${row?.postingcode || ''}-${row?.date || ''}`}>
                      <td>{row?.date ? dayjs(row.date).format(dateFormat) : '-'}</td>
                      <td>{row?.number || '-'}</td>
                      <td>{row?.postingcode || '-'}</td>
                      <td>{row?.source || '-'}</td>
                      <td>{row?.description || '-'}</td>
                      <td>
                        {moneyFormatter({
                          amount: Number(row?.Debit || 0),
                          currency_code: row?.currency || 'NGN',
                        })}
                      </td>
                      <td>
                        {moneyFormatter({
                          amount: Number(row?.Credit || 0),
                          currency_code: row?.currency || 'NGN',
                        })}
                      </td>
                      <td>{row?.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="gl-account-detail__print-total">
                <span>
                  Total Debit:{' '}
                  {moneyFormatter({
                    amount: totals.debit,
                    currency_code: 'NGN',
                  })}
                </span>
                <span>
                  Total Credit:{' '}
                  {moneyFormatter({
                    amount: totals.credit,
                    currency_code: 'NGN',
                  })}
                </span>
                <span>
                  Net:{' '}
                  {moneyFormatter({
                    amount: totals.net,
                    currency_code: 'NGN',
                  })}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ErpLayout>
  );
}
