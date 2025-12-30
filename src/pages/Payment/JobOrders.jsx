import { useEffect, useState } from 'react';
import { ErpLayout } from '@/layout';
import { Form, Input, InputNumber, DatePicker, Button, message, Table } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';
import dayjs from 'dayjs';

export default function PaymentJobOrders() {
  const [form] = Form.useForm();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const [current, setCurrent] = useState(null);
  const [selectKey, setSelectKey] = useState(0);
  const [entries, setEntries] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const cardStyle = {
    background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%)',
    border: '1px solid #e6eaf0',
    borderRadius: 12,
    padding: 14,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  };
  const summaryStyle = {
    border: '1px solid #edf0f4',
    background: '#fbfcfe',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  };
  const gridItemStyle = { marginBottom: 0 };
  const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px 12px',
  };
  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '10px 12px',
  };

  const loadEntries = async () => {
    try {
      const resp = await request.list({
        entity: 'paymentjo',
        options: { items: 50, sortBy: 'createdAt', sortValue: -1 },
      });
      if (resp?.result) setEntries(resp.result);
      else if (Array.isArray(resp)) setEntries(resp);
      else if (Array.isArray(resp?.data)) setEntries(resp.data);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [refreshKey]);

  const loadPayment = async (id) => {
    if (!id || id === 'redirectURL') return;
    try {
      const { success, result } = await request.read({ entity: 'paymentjo', id });
      if (success) setCurrent(result);
    } catch {
      setCurrent(null);
    }
  };

  useEffect(() => {
    if (current) {
      form.setFieldsValue({
        payRef: current?.payRef || current?.invoiceNumber || '',
        payDate: current?.payDate ? dayjs(current.payDate) : dayjs(),
        bankAmount: Number(current?.bankAmount || current?.netPayable || 0),
        whtAmount: Number(current?.whtAmount || 0),
        note: current?.note || `Payment for ${current?.invoiceNumber || ''}`,
      });
    } else {
      form.resetFields(['payRef', 'payDate', 'bankAmount', 'whtAmount', 'bankId', 'tellerNo', 'note', 'paymentJoId']);
    }
  }, [current]);

  const onSubmit = async (values) => {
    if (!current?._id) return;
    const payload = {
      payRef: values.payRef,
      payDate: values.payDate?.toISOString?.() || values.payDate,
      bankAmount: Number(values.bankAmount || 0) || 0,
      whtAmount: Number(values.whtAmount || 0) || 0,
      bankId: values.bankId || null,
      tellerNo: values.tellerNo || '',
      note: values.note || '',
    };
    try {
      const resp = await request.post({
        entity: `paymentjo/pay/${current._id}`,
        jsonData: payload,
      });
      if (resp?.success) {
        message.success(resp?.message || 'Job Order payment recorded');
        setCurrent(null);
        form.resetFields();
        setSelectKey((k) => k + 1);
        setRefreshKey((k) => k + 1);
      } else if (resp?.message) {
        message.error(resp.message);
      }
    } catch (e) {
      message.error('Failed to record payment');
    }
  };

  const payable = Number(current?.netPayable || 0) || 0;

  return (
    <ErpLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 12, fontSize: 20, fontWeight: 600, color: '#0f172a' }}>Payment - Job Orders</h2>
        <Form
          form={form}
          layout='vertical'
          size='small'
          onFinish={onSubmit}
          style={cardStyle}
        >
          <Form.Item
            name='paymentJoId'
            label='Select Approved Invoice JO'
            rules={[{ required: true }]}
            style={{ marginBottom: 12 }}
          >
            <SelectAsync
              key={`paymentjo-select-${selectKey}`}
              entity={'paymentjo'}
              outputValue={'_id'}
              displayLabels={['invoiceNumber']}
              placeholder={'Select Invoice JO awaiting payment'}
              listOptions={{ filter: 'status', equal: 'Draft', sortBy: 'createdAt', sortValue: -1 }}
              size='small'
              style={{ width: '100%' }}
              onChange={(id) => {
                form.setFieldsValue({ paymentJoId: id });
                loadPayment(id);
              }}
            />
          </Form.Item>

          {current && (
            <>
              <div style={summaryStyle}>
                <div style={summaryGridStyle}>
                  <Form.Item label='Vendor' style={gridItemStyle}>
                    <Input value={current?.vendorName || current?.vendorId?.name || ''} readOnly size='small' />
                  </Form.Item>
                  <Form.Item label='Invoice No' style={gridItemStyle}>
                    <Input value={current?.invoiceNumber || ''} readOnly size='small' />
                  </Form.Item>
                  <Form.Item label='Currency' style={gridItemStyle}>
                    <Input value={current?.currency || 'NGN'} readOnly size='small' />
                  </Form.Item>
                  <Form.Item label='Net Payable' style={gridItemStyle}>
                    <Input value={moneyFormatter({ amount: payable, currency_code: current?.currency || 'NGN' })} readOnly size='small' />
                  </Form.Item>
                </div>
              </div>

              <div style={formGridStyle}>
                <Form.Item name='payRef' label='Payment Reference' rules={[{ required: true }]} style={gridItemStyle}>
                  <Input placeholder='Payment reference' size='small' />
                </Form.Item>
                <Form.Item name='payDate' label='Payment Date' rules={[{ required: true }]} style={gridItemStyle}>
                  <DatePicker style={{ width: '100%' }} format={dateFormat} size='small' />
                </Form.Item>
                <Form.Item name='bankId' label='Bank' rules={[{ required: true }]} style={gridItemStyle}>
                  <SelectAsync
                    entity={'bank'}
                    outputValue={'_id'}
                    displayLabels={['name', 'accountNumber']}
                    placeholder={'Select bank'}
                    size='small'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item name='bankAmount' label='Bank Amount' rules={[{ required: true }]} style={gridItemStyle}>
                  <InputNumber min={0} style={{ width: '100%' }} size='small' />
                </Form.Item>
                <Form.Item name='whtAmount' label='WHT Amount' style={gridItemStyle}>
                  <InputNumber min={0} style={{ width: '100%' }} size='small' />
                </Form.Item>
                <Form.Item name='tellerNo' label='Teller/Cheque No' style={gridItemStyle}>
                  <Input size='small' />
                </Form.Item>
                <Form.Item name='note' label='Description' style={{ ...gridItemStyle, gridColumn: '1 / -1' }}>
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 2 }} />
                </Form.Item>
              </div>

              <div style={{ textAlign: 'right', marginTop: 12 }}>
                <Button type='primary' htmlType='submit' size='small'>
                  Record Payment
                </Button>
              </div>
            </>
          )}
        </Form>

        <div style={{ marginTop: 24 }}>
          <Table
            size='small'
            dataSource={entries}
            rowKey={(row) => row?._id}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Invoice', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
              { title: 'Vendor', dataIndex: 'vendorName', key: 'vendorName' },
              {
                title: 'Net Payable',
                dataIndex: 'netPayable',
                key: 'netPayable',
                align: 'right',
                render: (v, r) => moneyFormatter({ amount: v || 0, currency_code: r?.currency || 'NGN' }),
              },
              { title: 'Status', dataIndex: 'status', key: 'status' },
              {
                title: 'Approval',
                dataIndex: 'approvalStatus',
                key: 'approvalStatus',
                render: (v) => (v === 'Approved' ? 'Approved' : 'Pending'),
              },
              {
                title: 'Payment Ref',
                dataIndex: 'payRef',
                key: 'payRef',
                render: (v) => v || '-',
              },
              {
                title: 'Payment Date',
                dataIndex: 'payDate',
                key: 'payDate',
                render: (v) => (v ? dayjs(v).format(dateFormat) : '-'),
              },
            ]}
          />
        </div>
      </div>
    </ErpLayout>
  );
}
