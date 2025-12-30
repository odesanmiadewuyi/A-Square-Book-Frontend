import { useEffect, useRef, useState } from 'react';
import { Card, Form, DatePicker, InputNumber, Button, message, Input, Space, Table, Row, Col } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/settings/selectors';
import { useNavigate } from 'react-router-dom';
import useCanForm from '@/auth/useCanForm';

const formatAmount = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const num = Number(value.toString().replace(/,/g, ''));
  if (Number.isNaN(num)) return '';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseAmount = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const cleaned = value.toString().replace(/,/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? '' : num;
};

const FormatOnBlurNumber = ({ onFocus, onBlur, formatter, parser, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const fmt = formatter || formatAmount;
  const prs = parser || parseAmount;
  return (
    <InputNumber
      {...rest}
      formatter={(val) => (focused ? val : fmt(val))}
      parser={(val) => prs(val)}
      onFocus={(e) => {
        setFocused(true);
        if (typeof onFocus === 'function') onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (typeof onBlur === 'function') onBlur(e);
      }}
    />
  );
};

export default function ARReceipt() {
  const [form] = Form.useForm();
  const addEntryRef = useRef(null);
  const [customerModel, setCustomerModel] = useState('Company');
  const [customerId, setCustomerId] = useState();
  const [lastReceiptId, setLastReceiptId] = useState(() => {
    try {
      return localStorage.getItem('lastArReceiptId') || '';
    } catch (_) {
      return '';
    }
  });
  const navigate = useNavigate();
  const canForm = useCanForm('ar');
  const canCreate = canForm('ar_receipt_create', 'ar');
  useEffect(() => {
    if (!canCreate) {
      message.error('Access denied');
      navigate('/');
    }
  }, [canCreate]);
  if (!canCreate) return null;
  // Open invoices / loading removed
  const { result: settingsResult } = useSelector(selectSettings);
  const gl = settingsResult?.gl_settings || {};
  const arControl = (gl?.gl_ar_control_postingcode || '').toString().trim();
  const defaultBank = (gl?.gl_ar_default_bank_id || '').toString().trim();
  const effectiveAR = (arControl || '').toString().trim();
  const effectiveBank = (defaultBank || '').toString().trim();

  // Removed invoice fetching and allocation columns
  const numericKeyGuard = (evt) => {
    if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
    const allowedKeys = ['Backspace','Tab','Delete','ArrowLeft','ArrowRight','Home','End','Enter'];
    if (allowedKeys.includes(evt.key)) return;
    if (/^[0-9.]$/.test(evt.key)) return;
    evt.preventDefault();
  };

  const onSubmit = async (values) => {
    try {
      if (!(values.arControl || effectiveAR)) { message.warning('Select AR Control Posting Code'); return; }
      if (!values.bankId && !effectiveBank) { message.warning('Select a bank or set a default bank'); return; }
      // Batch mode: if entries exist, send them; else fallback to single
      const receipts = Array.isArray(values.entries) ? values.entries.filter((e)=> e && e.amount && e.description) : [];
      const payload = receipts.length ? {
        customerId,
        customerModel,
        bankId: values.bankId || effectiveBank || undefined,
        arControl: values.arControl || effectiveAR || undefined,
        receipts: receipts.map((r)=> ({
          amount: r.amount,
          description: r.description,
          date: (r.date ? dayjs(r.date).format('YYYY-MM-DD') : (values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined)),
          arControl: r.arControl || values.arControl || effectiveAR || undefined,
          sourceNumber: (r.referenceNumber || values.referenceNumber) ? `${r.referenceNumber || values.referenceNumber}` : undefined,
        })),
      } : {
        customerId,
        customerModel,
        bankId: values.bankId || effectiveBank || undefined,
        amount: values.amount,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
        description: values.description || '',
        arControl: values.arControl || effectiveAR || undefined,
        sourceNumber: values.referenceNumber || undefined,
      };
      if (!customerId) return message.warning('Select a customer');
      if (!payload.bankId) return message.warning('Select a bank');
      if (!receipts.length && (payload.amount || 0) <= 0) return message.warning('Enter a valid amount');
      const { success, result } = await request.post({ entity: 'ar/receipt', jsonData: payload });
      if (success) {
        message.success('Receipt submitted for approval');
        const lastId = result?.paymentId || (Array.isArray(result?.payments) ? result.payments[result.payments.length - 1]?.paymentId : '');
        if (lastId) {
          setLastReceiptId(lastId);
          try { localStorage.setItem('lastArReceiptId', lastId); } catch (_) {}
        }
        form.resetFields(); setCustomerId(undefined);
      }
    } catch (e) {
      // errors handled globally
    }
  };

  const viewReceipt = () => {
    if (!lastReceiptId) {
      message.warning('No receipt to view yet');
      return;
    }
    navigate(`/reports/arreceipt/${lastReceiptId}?autoload=1`);
  };

  const addTopEntryToGrid = () => {
    const date = form.getFieldValue('date');
    const amount = form.getFieldValue('amount');
    const description = (form.getFieldValue('description') || '').toString().trim();
    const arCtrl = form.getFieldValue('arControl') || effectiveAR || undefined;
    const headerRef = (form.getFieldValue('referenceNumber') || `RCPT-${dayjs().format('YYYYMMDD-HHmmss')}`).toString();
    const currentEntries = form.getFieldValue(['entries']) || [];
    const idx = (Array.isArray(currentEntries) ? currentEntries.length : 0) + 1;
    const rowRef = `${headerRef}-${idx.toString().padStart(2,'0')}`;
    if (!amount || amount <= 0) {
      message.warning('Enter a valid amount to add');
      return;
    }
    if (!description) {
      message.warning('Enter description to add');
      return;
    }
    if (typeof addEntryRef.current === 'function') {
      addEntryRef.current({ date, amount, description, arControl: arCtrl, referenceNumber: rowRef });
      // Clear top amount/description after adding
      form.setFieldsValue({ amount: 0, description: '' });
      message.success('Entry added');
    }
  };

  return (
    <ErpLayout>
      <Card
        title='Accounts Receivable - Cash Receipt'
        size='small'
        styles={{ body: { padding: 16 } }}
        extra={
          <Space>
            <Button size='small' onClick={viewReceipt} disabled={!lastReceiptId}>
              View Receipt
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout='vertical'
          size='small'
          onFinish={onSubmit}
          style={{ rowGap: 8 }}
        >
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item label='Reference No' name='referenceNumber' initialValue={`RCPT-${dayjs().format('YYYYMMDD-HHmmss')}`} tooltip='Auto-generated; you can edit' style={{ marginBottom: 8 }}>
                <Input
                  size='small'
                  addonAfter={
                    <Button type='link' size='small' onClick={()=> form.setFieldsValue({ referenceNumber: `RCPT-${dayjs().format('YYYYMMDD-HHmmss')}` })}>
                      Regenerate
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='date' label='Date' initialValue={dayjs()} rules={[{ required: true, message: 'Please select a date' }]} style={{ marginBottom: 8 }}>
                <DatePicker size='small' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='bankId' label='Default Bank' initialValue={effectiveBank || undefined} rules={[{ required: true }]} style={{ marginBottom: 8 }}> 
                <SelectAsync size='small' entity={'bank'} outputValue={'_id'} displayLabels={['name','accountNumber']} placeholder='Select Default Bank' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='arControl' label='AR Control Posting Code' initialValue={effectiveAR || undefined} rules={[{ required: true, message: 'Please select AR Control Posting Code' }]} style={{ marginBottom: 8 }}>
                <SelectAsync size='small' entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select AR Control' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label='Customer Type' style={{ marginBottom: 8 }}>
                <select
                  value={customerModel}
                  onChange={(e) => {
                    setCustomerModel(e.target.value);
                    setCustomerId(undefined);
                    
                  }}
                  style={{ width: '100%', height: 28, padding: '0 6px', fontSize: 12 }}
                >
                  <option value='Client'>Customer</option>
                  <option value='Company'>Company</option>
                  <option value='Person'>Person</option>
                </select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label='Customer' style={{ marginBottom: 8 }}>
                {customerModel === 'Client' ? (
                  <SelectAsync
                    key={'client-selector'}
                    size='small'
                    entity={'client'}
                    outputValue={'_id'}
                    displayLabels={['name']}
                    placeholder='Select customer'
                    onChange={setCustomerId}
                    listOptions={{ limit: 100 }}
                  />
                ) : customerModel === 'Company' ? (
                  <SelectAsync
                    key={'company-selector'}
                    size='small'
                    entity={'company'}
                    outputValue={'_id'}
                    displayLabels={['name']}
                    placeholder='Select company'
                    onChange={setCustomerId}
                    listOptions={{ limit: 100 }}
                  />
                ) : (
                  <SelectAsync
                    key={'person-selector'}
                    size='small'
                    entity={'people'}
                    outputValue={'_id'}
                    displayLabels={['firstname','lastname']}
                    placeholder='Select person'
                    onChange={setCustomerId}
                    listOptions={{ limit: 50 }}
                    remoteSearch
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='amount' label={'Amount'} initialValue={0} rules={[{ validator: () => {
                const entries = form.getFieldValue(['entries']) || [];
                const v = form.getFieldValue('amount');
                return (Array.isArray(entries) && entries.length) || (v && v > 0)
                  ? Promise.resolve()
                  : Promise.reject(new Error('Enter amount or use Entries grid'));
              } }]} style={{ marginBottom: 8 }}>
                <FormatOnBlurNumber
                  min={0}
                  size='small'
                  style={{ width: '100%' }}
                  inputMode='decimal'
                  onKeyDown={numericKeyGuard}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='description' label='Description' rules={[{ validator: () => {
                const entries = form.getFieldValue(['entries']) || [];
                const v = (form.getFieldValue('description') || '').toString().trim();
                return (Array.isArray(entries) && entries.length) || v
                  ? Promise.resolve()
                  : Promise.reject(new Error('Enter description or use Entries grid'));
              } }]} style={{ marginBottom: 8 }}>
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder='Enter description' />
              </Form.Item>
            </Col>
          </Row>
          <Space style={{ marginBottom: 8 }}>
            <Button size='small' type='dashed' onClick={addTopEntryToGrid}>Add To Entries</Button>
          </Space>

          <Form.List name='entries'>
            {(fields, { add, remove }) => {
              // expose add to the outer scope so top controls can push into the grid
              addEntryRef.current = (defaultValue) => add(defaultValue);
              const columns = [
                {
                  title: 'Date',
                  key: 'date',
                  width: 190,
                  fixed: 'left',
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'date']} style={{ margin: 0 }}>
                      <DatePicker size='small' format='YYYY-MM-DD' style={{ width: '100%', minWidth: 170 }} />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Reference No',
                  key: 'referenceNumber',
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'referenceNumber']} style={{ margin: 0 }} rules={[{ required: true, message: 'Required' }]}>
                      <Input size='small' placeholder='Reference No' />
                    </Form.Item>
                  ),
                },
                {
                  title: 'AR Control Posting Code',
                  key: 'arControl',
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'arControl']} style={{ margin: 0 }} rules={[{ required: true, message: 'Required' }]}>
                      <SelectAsync size='small' entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select AR Control' />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  render: (_, field) => (
                    <Form.Item
                      name={[field.name, 'amount']}
                      style={{ margin: 0 }}
                      rules={[{ required: true }, { validator: (_, v) => (v && v > 0) ? Promise.resolve() : Promise.reject(new Error('> 0')) }]}
                    >
                      <FormatOnBlurNumber
                        min={0}
                        size='small'
                        style={{ width: '100%' }}
                        inputMode='decimal'
                        onKeyDown={numericKeyGuard}
                      />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Description',
                  key: 'description',
                  width: 260,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'description']} style={{ margin: 0 }} rules={[{ required: true }]}>
                      <Input size='small' placeholder='Description' maxLength={150} />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  align: 'right',
                  render: (_, field) => (
                    <Button size='small' type='link' danger icon={<MinusCircleOutlined />} onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  ),
                },
              ];

              return (
                <div>
                  <Space align='baseline' style={{ marginBottom: 8 }}>
                    <strong>Entries</strong>
                  </Space>
              <Table
                rowKey={(f) => f.key}
                dataSource={fields}
                columns={columns}
                pagination={false}
                scroll={{ x: 1100 }}
              />
                </div>
              );
            }}
          </Form.List>
          {/* Open Invoices section removed */}
          <div style={{ marginTop: 12 }}>
            <Button size='small' type='primary' htmlType='submit'>Submit for Approval</Button>
          </div>
        </Form>
      </Card>
    </ErpLayout>
  );
}
