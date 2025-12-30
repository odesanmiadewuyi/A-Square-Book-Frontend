import React from 'react';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import { Modal, Form, DatePicker, InputNumber, Input, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import SelectAsync from '@/components/SelectAsync';
import { useDispatch } from 'react-redux';
import { erp as erpActions } from '@/redux/erp/actions';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import usePermissionConfig from '@/auth/usePermissionConfig';

export default function ARReceiptsList() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const navigate = useNavigate();

  const entity = 'ar/receipt';
  const dispatch = useDispatch();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form] = Form.useForm();
  const [refFilter, setRefFilter] = React.useState('');
  const [customerModel, setCustomerModel] = React.useState('Client');
  const [customerId, setCustomerId] = React.useState();
  const [dateRange, setDateRange] = React.useState(null);
  const dataTableColumns = [
    { title: 'Date', dataIndex: 'docDate', render: (v) => (v ? dayjs(v).format(dateFormat) : '') },
    { title: 'Reference No', dataIndex: 'sourceNumber' },
    { title: 'Customer', dataIndex: ['customer','name'], render: (_, r) => {
        const cm = r?.customerModel;
        const c = r?.customer || {};
        if (cm === 'Person') return `${c.firstname || ''} ${c.lastname || ''}`.trim();
        return c.name || '';
      }
    },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v, r) => moneyFormatter({ amount: Math.abs(parseFloat(v||0)), currency_code: r?.currency || 'NGN' }) },
    { title: 'Approval', dataIndex: 'approvalStatus', render: (v) => (v === 'Pending' ? 'Pending' : 'Approved') },
    { title: 'Description', dataIndex: 'description' },
    { title: 'AR Control', dataIndex: 'controlAccountCode' },
  ];

  const buildDefaultOptions = (rangeOverride = dateRange) => {
    const opts = {};
    if (refFilter) opts.ref = refFilter;
    if (customerId) opts.customer = customerId;
    const from = rangeOverride?.[0]?.format?.('YYYY-MM-DD');
    const to = rangeOverride?.[1]?.format?.('YYYY-MM-DD');
    if (from) opts.from = from;
    if (to) opts.to = to;
    return opts;
  };

  const baseConfig = {
    entity,
    PANEL_TITLE: 'AR Receipts',
    DATATABLE_TITLE: 'AR Receipts',
    ADD_NEW_ENTITY: 'New AR Receipt',
    addNewPath: '/ar/receipt',
    dataTableColumns,
    // Maintain active filters for pagination
    defaultListOptions: buildDefaultOptions(),
    disableRead: true,
    disableEdit: true,
    disableDelete: true,
    disableDownload: true,
    onRowClick: (record) => {
      if (!record?._id) return;
      navigate(`/reports/arreceipt/${record._id}?autoload=1`);
    },
    extraMenuItems: [
      { label: 'Edit (Reverse & Repost)', key: 'ar-edit' },
      { label: 'Reverse (Safe Delete)', key: 'ar-reverse' },
    ],
    headerExtras: () => ([
      <Button
        key="receipt-report"
        onClick={() => navigate('/reports/arreceipt/list?autoload=1')}
      >
        {translate('View Receipt') || 'View Receipt'}
      </Button>,
      <DatePicker.RangePicker
        key="receipt-date-range"
        value={dateRange}
        onChange={(range) => {
          setDateRange(range);
          dispatch(erpActions.list({ entity, options: buildDefaultOptions(range) }));
        }}
        format="YYYY-MM-DD"
        allowClear
        placeholder={['Start date', 'End date']}
        style={{ width: 240 }}
      />,
      <Input.Search
        key={'ref-search'}
        placeholder='Filter by Reference No'
        allowClear
        style={{ width: 260 }}
        onSearch={(val)=>{ const v = (val||'').trim(); setRefFilter(v); dispatch(erpActions.list({ entity, options: { ...buildDefaultOptions(), ref: v } })); }}
        onChange={(e)=>{ if (!e.target.value) { const v=''; setRefFilter(v); dispatch(erpActions.list({ entity, options: buildDefaultOptions() })); } }}
      />,
      <select key={'cust-model'} value={customerModel} onChange={(e)=>{ setCustomerModel(e.target.value); setCustomerId(undefined); }} style={{ marginLeft: 8 }}>
        <option value='Client'>Customer</option>
        <option value='Company'>Company</option>
        <option value='Person'>Person</option>
      </select>,
      <SelectAsync
        key={'cust-selector'}
        entity={customerModel === 'Client' ? 'client' : customerModel === 'Company' ? 'company' : 'people'}
        outputValue={'_id'}
        displayLabels={customerModel === 'Person' ? ['firstname','lastname'] : ['name']}
        placeholder={'Select ' + (customerModel === 'Person' ? 'person' : customerModel.toLowerCase())}
        onChange={(val)=>{ setCustomerId(val); const opts = { ...buildDefaultOptions(), customer: val }; dispatch(erpActions.list({ entity, options: opts })); }}
        listOptions={{ limit: 100 }}
        remoteSearch={customerModel === 'Person'}
      />
    ]),
  };

  const { effectiveConfig, formKeys, moduleKey, canForm } = usePermissionConfig(baseConfig);
  const canEdit = canForm(formKeys.update || formKeys.create, moduleKey);
  const config = {
    ...baseConfig,
    ...effectiveConfig,
    onRowAction: async (key, record) => {
      if (key === 'ar-reverse') {
        if (!canEdit) {
          message.error('Access denied');
          return;
        }
        Modal.confirm({
          title: 'Reverse this receipt?',
          content: 'This creates a reversing GL journal, removes applications, and marks the receipt removed.',
          okText: 'Reverse',
          okButtonProps: { danger: true },
          onOk: async () => {
            const { success, message: msg } = await request.delete({ entity: 'ar/receipt', id: record._id });
            if (success) {
              message.success('Receipt reversed');
              dispatch(erpActions.list({ entity, options: buildDefaultOptions() }));
            } else message.error(msg || 'Reverse failed');
          },
        });
      }
      if (key === 'ar-edit') {
        if (!canEdit) {
          message.error('Access denied');
          return;
        }
        setEditing(record);
        form.setFieldsValue({
          amount: Math.abs(parseFloat(record.amount || 0) || 0),
          date: record.docDate ? dayjs(record.docDate) : undefined,
          description: record.description || record.notes || '',
          arControl: record.controlAccountCode || undefined,
          referenceNumber: record.sourceNumber || `RCPT-${dayjs().format('YYYYMMDD-HHmmss')}`,
        });
        setEditOpen(true);
      }
    },
  };

  return (
    <ErpLayout>
      <ErpPanel config={effectiveConfig} />
      <Modal
        title='Edit Receipt (Reverse & Repost)'
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout='vertical' onFinish={async (values) => {
          try {
            if (!editing?._id) return;
            const payload = {};
            if (values.amount) payload.amount = values.amount;
            if (values.date) payload.date = values.date.format('YYYY-MM-DD');
            if (values.description) payload.description = values.description;
            if (values.bankId) payload.bankId = values.bankId;
            if (values.arControl) payload.arControl = values.arControl;
            if (values.referenceNumber) payload.sourceNumber = values.referenceNumber;
            const { success, message: msg } = await request.update({ entity: 'ar/receipt', id: editing._id, jsonData: payload });
            if (success) {
              message.success('Receipt updated');
              setEditOpen(false);
              setEditing(null);
              form.resetFields();
              dispatch(erpActions.list({ entity, options: buildDefaultOptions() }));
            } else message.error(msg || 'Update failed');
          } catch (e) { message.error('Update failed'); }
        }}>
          <Form.Item name='date' label='Date'>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='referenceNumber' label='Reference No' initialValue={`RCPT-${dayjs().format('YYYYMMDD-HHmmss')}`}>
            <Input />
          </Form.Item>
          <Form.Item name='amount' label='Amount'>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <Input />
          </Form.Item>
          <Form.Item name='bankId' label='Bank'>
            <SelectAsync entity={'bank'} outputValue={'_id'} displayLabels={['name','accountNumber']} placeholder='Keep existing if not changed' />
          </Form.Item>
          <Form.Item name='arControl' label='AR Control Posting Code'>
            <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Keep existing if not changed' />
          </Form.Item>
          <Space style={{ display:'flex', justifyContent:'flex-end' }}>
            <Button onClick={()=> setEditOpen(false)}>Cancel</Button>
            <Button type='primary' onClick={()=> form.submit()}>Save</Button>
          </Space>
        </Form>
      </Modal>
    </ErpLayout>
  );
}
