import { useEffect, useState } from 'react';
import { ErpLayout } from '@/layout';
import { Form, Input, Button, DatePicker, Table, Row, Col, message } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';

export default function APCustomerInvoiceApprove() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [controlAccount, setControlAccount] = useState('');
  const [invoiceSelectKey, setInvoiceSelectKey] = useState(0);
  const [accountSelectKey, setAccountSelectKey] = useState(0);

  useEffect(() => {
    setControlAccount('');
  }, [current?._id]);

  const loadInvoice = async (id) => {
    if (!id || id === 'redirectURL') return;
    try {
      const { success, result } = await request.read({ entity: 'apcustomerinvoice', id });
      if (success) setCurrent(result);
    } catch {
      setCurrent(null);
    }
  };

  const onApprove = async () => {
    if (!current?._id) return;
    if (!controlAccount) {
      message.error('Select control account');
      return;
    }
    setLoading(true);
    try {
      const { success, message: msg } = await request.post({
        entity: `apcustomerinvoice/approve/${current._id}`,
        jsonData: { controlAccount },
      });
      if (success) {
        message.success('Customer-Invoice approved');
        setCurrent(null);
        setControlAccount('');
        form.resetFields();
        setInvoiceSelectKey((k) => k + 1);
        setAccountSelectKey((k) => k + 1);
      } else {
        message.error(msg || 'Approval failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const numberStr = (rec) =>
    rec?.displayNumber ||
    rec?.voucherNumber ||
    (rec?.number ? `INV-${String(rec.number).padStart(6, '0')}` : '');

  const denseItem = { marginBottom: 10 };
  const sectionStyle = {
    border: '1px solid #f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    background: '#fff',
  };
  const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 13,
  };

  return (
    <ErpLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 12 }}>{translate('Approve')} Customer-Invoice</h2>
        <Form form={form} layout='vertical' size='small'>
          <Form.Item
            name='invoice'
            label='Select Customer-Invoice'
            rules={[{ required: true }]}
            style={denseItem}
          >
            <SelectAsync
              key={`invoice-${invoiceSelectKey}`}
              entity={'apcustomerinvoice'}
              outputValue={'_id'}
              displayLabels={['voucherNumber']}
              placeholder={'Select Customer-Invoice'}
              listOptions={{ filter: 'approved', equal: false }}
              onChange={(id) => loadInvoice(id)}
              remoteSearch={true}
              size='small'
            />
          </Form.Item>

          {current && (
            <>
              <div style={sectionStyle}>
                <Row gutter={[12, 8]}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={'Control Account (Debit)'} required style={denseItem}>
                      <SelectAsync
                        key={`control-${accountSelectKey}`}
                        entity={'glaccounts'}
                        outputValue={'code'}
                        displayLabels={['code', 'name']}
                        placeholder={'Select control account'}
                        onChange={(val) => setControlAccount(val)}
                        size='small'
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={translate('Date')} style={denseItem}>
                      <DatePicker
                        style={{ width: '100%' }}
                        size='small'
                        value={current?.date ? dayjs(current.date) : null}
                        format={dateFormat}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={translate('Client')} style={denseItem}>
                      <Input value={current?.client?.name || ''} readOnly size='small' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={translate('number')} style={denseItem}>
                      <Input value={numberStr(current)} readOnly size='small' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={translate('Description')} style={{ marginBottom: 0 }}>
                      <Input.TextArea
                        value={current?.notes || ''}
                        readOnly
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div style={sectionStyle}>
                <Table
                  size='small'
                  pagination={false}
                  rowKey={(r) =>
                    r?._id ||
                    `${r?.itemName || ''}-${r?.description || ''}-${r?.quantity || ''}-${r?.price || ''}`
                  }
                  dataSource={Array.isArray(current?.items) ? current.items : []}
                  columns={[
                    { title: 'Posting Code', dataIndex: 'itemName' },
                    { title: translate('Description'), dataIndex: 'description' },
                    { title: translate('Quantity'), dataIndex: 'quantity', align: 'right' },
                    {
                      title: translate('Price'),
                      dataIndex: 'price',
                      align: 'right',
                      render: (v) =>
                        moneyFormatter({ amount: v || 0, currency_code: current?.currency || 'NGN' }),
                    },
                    {
                      title: translate('Total'),
                      dataIndex: 'total',
                      align: 'right',
                      render: (v) =>
                        moneyFormatter({ amount: v || 0, currency_code: current?.currency || 'NGN' }),
                    },
                  ]}
                />
              </div>

              <div style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={summaryRow}>
                  <span>{translate('Sub Total')}</span>
                  <strong>
                    {moneyFormatter({ amount: current?.subTotal || 0, currency_code: current?.currency || 'NGN' })}
                  </strong>
                </div>
                <div style={summaryRow}>
                  <span>VAT</span>
                  <strong>
                    {moneyFormatter({ amount: current?.taxTotal || 0, currency_code: current?.currency || 'NGN' })}
                  </strong>
                </div>
                <div style={{ ...summaryRow, marginBottom: 0, fontSize: 14 }}>
                  <span>{translate('Total')}</span>
                  <strong>
                    {moneyFormatter({ amount: current?.total || 0, currency_code: current?.currency || 'NGN' })}
                  </strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Button
                  type='primary'
                  onClick={onApprove}
                  loading={loading}
                  disabled={current?.approved === true}
                  size='small'
                >
                  {current?.approved ? translate('Approved') : translate('Approve')}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </ErpLayout>
  );
}
