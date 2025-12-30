import { useEffect, useState } from 'react';
import { ErpLayout } from '@/layout';
import { Form, Input, Button, DatePicker, Row, Col, message, Table, Typography } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';

export default function InvoiceJOApprove() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  // Removed manual AP/VAT selections; backend resolves defaults
  const [invSelectKey, setInvSelectKey] = useState(0);
  const location = useLocation();
  // Auto-load newly created invoice if navigated from Create
  useEffect(() => {
    try {
      const selId = location?.state?.createId;
      if (selId) {
        form.setFieldsValue({ invoice: selId });
        loadInvoice(selId);
      }
    } catch {}
  }, [location?.state]);
  const netVal = current ? (Number(current?.netAmount || 0) || 0) : 0;
  const vatVal = current ? (Number(current?.vatAmount || 0) || 0) : 0;
  const whtRateVal = current ? (Number(current?.whtRate || 0) || 0) : 0;
  const stampRateVal = current ? (Number(current?.stampRate || 0) || 0) : 0;
  const retentionRateVal = current ? (Number(current?.retentionRate || 0) || 0) : 0;
  const whtAmount = (netVal * whtRateVal) / 100;
  const stampAmount = (netVal * stampRateVal) / 100;
  const retentionAmount = (netVal * retentionRateVal) / 100;

  const loadInvoice = async (id) => {
    if (!id || id === 'redirectURL') return;
    try {
      const { success, result } = await request.read({ entity: 'invoicejo', id });
      if (success) setCurrent(result);
    } catch {
      setCurrent(null);
    }
  };

  const onApprove = async () => {
    if (!current?._id) return;
    setLoading(true);
    try {
      const { success, message: msg } = await request.post({ entity: `invoicejo/approve/${current._id}`, jsonData: { } });
      if (success) {
        message.success('Invoice JO approved to AP Bill');
        // Reset selection
        setCurrent(null);
        form.resetFields();
        setInvSelectKey((k)=>k+1);
      } else {
        message.error(msg || 'Approval failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Build a preview of GL entries that will be posted on approval
  const linesPreview = (() => {
    if (!current) return [];
    const entries = [];
    const expenseCode = (current?.budgetLineId?.glAccount || '').toString();
    const net = Math.abs(parseFloat(current?.netAmount || 0)) || 0;
    const vat = Math.abs(parseFloat(current?.vatAmount || 0)) || 0;
    const gross = net + vat;

    if (expenseCode && net > 0) {
      entries.push({ key: 'exp', account: expenseCode, side: 'Debit', amount: net, note: 'Expense (from Budget Line)' });
    }
    // Per request, hide VAT Input (auto) and AP Control (auto) from preview
    // VAT and AP control postings are handled automatically on backend approval
    // if (vat > 0) {
    //   entries.push({ key: 'vat', account: 'VAT Input (auto)', side: 'Debit', amount: vat, note: 'VAT Input' });
    // }
    // if (gross > 0) {
    //   entries.push({ key: 'ap', account: 'AP Control (auto)', side: 'Credit', amount: gross, note: 'AP Control' });
    // }
    return entries;
  })();

  const totalsPreview = linesPreview.reduce((acc, ln) => {
    const amt = Number(ln.amount || 0) || 0;
    if (ln.side === 'Debit') acc.debit += amt; else acc.credit += amt;
    return acc;
  }, { debit: 0, credit: 0 });

  const pageStyle = {
    maxWidth: 680,
    margin: '0 auto',
    padding: 12,
    '--ap-shell': '#f7f5ee',
    '--ap-surface': '#ffffff',
    '--ap-border': '#e3ded2',
    '--ap-muted': '#6b6b6b',
    '--ap-shadow': '0 12px 24px rgba(0, 0, 0, 0.06)',
  };
  const shellStyle = {
    background: 'linear-gradient(180deg, var(--ap-shell), #ffffff 65%)',
    border: '1px solid var(--ap-border)',
    borderRadius: 16,
    padding: 14,
    boxShadow: 'var(--ap-shadow)',
  };
  const titleStyle = { marginBottom: 10, fontSize: 18, fontWeight: 600 };
  const denseItem = { marginBottom: 6 };
  const sectionStyle = {
    border: '1px solid var(--ap-border)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    background: 'var(--ap-surface)',
  };
  const summaryRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 };

  return (
    <ErpLayout>
      <div style={pageStyle}>
        <div style={shellStyle}>
          <h2 style={titleStyle}>{translate('Approve')} Invoice (Job Orders)</h2>
          <Form form={form} layout='vertical' size='small'>
            <Form.Item name='invoice' label='Select Invoice JO' rules={[{ required: true }]} style={denseItem}>
              <SelectAsync
                key={`invoicejo-${invSelectKey}`}
                entity={'invoicejo'}
                outputValue={'_id'}
                displayLabels={['invoiceNo']}
                placeholder={'Select Posted Invoice JO'}
                // Show only Posted invoices (ready for approval)
                listOptions={{ filter: 'status', equal: 'Posted', items: 50, sortBy: 'createdAt', sortValue: -1 }}
                remoteSearch={true}
                value={form.getFieldValue('invoice')}
                onChange={(id)=> loadInvoice(id)}
                size='small'
              />
            </Form.Item>

            {current && (
              <>
                <div style={sectionStyle}>
                  <Row gutter={[12, 6]}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={'Vendor'} style={denseItem}>
                        <Input value={current?.vendorId?.name || ''} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={'JO'} style={denseItem}>
                        <Input value={current?.joId?.joNo || ''} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={'Invoice No'} style={denseItem}>
                        <Input value={current?.invoiceNo || ''} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={'Invoice Date'} style={denseItem}>
                        <DatePicker
                          style={{ width: '100%' }}
                          size='small'
                          value={current?.invoiceDate ? dayjs(current.invoiceDate) : null}
                          format={dateFormat}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <div style={sectionStyle}>
                  <Row gutter={[12, 6]}>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Net Amount'} style={denseItem}>
                        <Input value={moneyFormatter({ amount: netVal, currency_code: 'NGN' })} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'VAT Amount'} style={denseItem}>
                        <Input value={moneyFormatter({ amount: vatVal, currency_code: 'NGN' })} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'WHT (%)'} style={denseItem}>
                        <Input value={`${whtRateVal}`} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'WHT Amount'} style={denseItem}>
                        <Input value={moneyFormatter({ amount: whtAmount, currency_code: 'NGN' })} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Stamp Duty (%)'} style={denseItem}>
                        <Input value={`${stampRateVal}`} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Stamp Duty Amount'} style={denseItem}>
                        <Input value={moneyFormatter({ amount: stampAmount, currency_code: 'NGN' })} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Retention (%)'} style={denseItem}>
                        <Input value={`${retentionRateVal}`} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Retention Amount'} style={denseItem}>
                        <Input value={moneyFormatter({ amount: retentionAmount, currency_code: 'NGN' })} readOnly size='small' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item label={'Total'} style={denseItem}>
                        <Input
                          value={moneyFormatter({
                            amount: current?.grossAmount ?? (netVal + vatVal - whtAmount - stampAmount - retentionAmount),
                            currency_code: 'NGN',
                          })}
                          readOnly
                          size='small'
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Removed manual posting code selections; backend resolves defaults */}

                {/* Transaction entries preview */}
                <div style={sectionStyle}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>
                    Transaction Entries
                  </Typography.Title>
                  <Table
                    size='small'
                    pagination={false}
                    className='no-row-separator'
                    dataSource={linesPreview}
                    columns={[
                      { title: 'Posting Code', dataIndex: 'account', key: 'account' },
                      { title: 'Side', dataIndex: 'side', key: 'side', width: 90 },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        align: 'right',
                        render: (v) => moneyFormatter({ amount: v || 0, currency_code: 'NGN' }),
                      },
                      { title: 'Note', dataIndex: 'note', key: 'note' },
                    ]}
                    footer={() => (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24 }}>
                        <div>
                          <b>Total Debit:</b>{' '}
                          {moneyFormatter({ amount: totalsPreview.debit || 0, currency_code: 'NGN' })}
                        </div>
                      </div>
                    )}
                  />
                </div>

                <div style={sectionStyle}>
                  <Row align='middle' gutter={[12, 6]}>
                    <Col xs={24} sm={16}>
                      <div style={{ ...summaryRow, fontSize: 14 }}>
                        <span>{translate('Total')}</span>
                        <strong>
                          {moneyFormatter({
                            amount: current?.grossAmount ?? (netVal + vatVal - whtAmount - stampAmount - retentionAmount),
                            currency_code: 'NGN',
                          })}
                        </strong>
                      </div>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                      <Button type='primary' onClick={onApprove} loading={loading} size='small'>
                        Approve
                      </Button>
                    </Col>
                  </Row>
                </div>
                {/* Removed imbalance hint since codes are auto-resolved */}
              </>
            )}
          </Form>
        </div>
      </div>
    </ErpLayout>
  );
}



