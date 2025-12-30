import { useEffect, useMemo, useState } from 'react';
import { Card, Form, DatePicker, InputNumber, Button, Table, Space, message, Input, Alert } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useSelector, useDispatch } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';

export default function ARCreditNote() {
  const [form] = Form.useForm();
  const [customerModel, setCustomerModel] = useState('Company');
  const [customerId, setCustomerId] = useState();
  const [openInvoices, setOpenInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { result: settingsResult } = useSelector(selectSettings);
  const dispatch = useDispatch();
  const gl = settingsResult?.gl_settings || {};
  const arControl = (gl?.gl_ar_control_postingcode || '').toString().trim();
  const returnsCode = (gl?.gl_ar_returns_postingcode || '').toString().trim();
  const [newARControl, setNewARControl] = useState('');
  const [newReturns, setNewReturns] = useState('');
  const effectiveAR = (arControl || newARControl || '').toString().trim();
  const effectiveReturns = (returnsCode || newReturns || '').toString().trim();

  const fetchOpenInvoices = async (cid) => {
    if (!cid) return setOpenInvoices([]);
    setLoading(true);
    try {
      const { success, result } = await request.filter({ entity: 'ar/transaction', options: { filter: 'customer', equal: cid } });
      if (success && Array.isArray(result)) {
        const list = result
          .filter((t) => t.type === 'invoice' && t.status === 'open')
          .map((t) => ({ key: t._id, _id: t._id, sourceNumber: t.sourceNumber || '', docDate: t.docDate, dueDate: t.dueDate, amount: t.amount || 0, apply: 0 }));
        setOpenInvoices(list);
      } else setOpenInvoices([]);
    } catch (e) { setOpenInvoices([]); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchOpenInvoices(customerId); }, [customerId]);

  const columns = [
    { title: 'Invoice #', dataIndex: 'sourceNumber' },
    { title: 'Date', dataIndex: 'docDate', render: (v)=> (v? new Date(v).toISOString().slice(0,10):'') },
    { title: 'Due', dataIndex: 'dueDate', render: (v)=> (v? new Date(v).toISOString().slice(0,10):'') },
    { title: 'Amount', dataIndex: 'amount', align:'right', render:(v)=> Number(v||0).toLocaleString() },
    { title: 'Apply', dataIndex:'apply', align:'right', render:(_,r)=> <InputNumber min={0} style={{ width:'100%' }} value={r.apply} onChange={(val)=> setOpenInvoices((prev)=> prev.map((x)=> x._id===r._id ? { ...x, apply: parseFloat(val||0) } : x)) } /> },
  ];
  const totalApplied = useMemo(()=> openInvoices.reduce((acc,it)=> acc + (parseFloat(it.apply)||0), 0), [openInvoices]);

  const onSubmit = async (values) => {
    try{
      if (!effectiveAR || !effectiveReturns) { message.warning('Configure AR Control and Returns posting codes'); return; }
      const allocations = openInvoices.filter((x)=> (parseFloat(x.apply)||0)>0).map((x)=> ({ invoiceId: x._id, amount: parseFloat(x.apply)||0 }));
      const payload = {
        customerId,
        customerModel,
        amount: values.amount || totalApplied,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
        allocations,
        description: values.description || '',
      };
      if (!payload.customerId) return message.warning('Select a customer');
      if ((payload.amount||0) <= 0) return message.warning('Enter amount or allocations');
      const { success } = await request.post({ entity: 'ar/credit-note', jsonData: payload });
      if (success){ message.success('Credit posted'); form.resetFields(); setOpenInvoices([]); setCustomerId(undefined); }
    } catch(e){}
  };

  return (
    <ErpLayout>
      <Card title='Accounts Receivable — Credit Note'>
        {(!effectiveAR || !effectiveReturns) && (
          <Alert type='warning' showIcon style={{ marginBottom: 12 }} message='Missing GL settings' description={
            <Space direction='vertical'>
              {!arControl && (<Space><span>AR Control Posting Code:</span><SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} onChange={setNewARControl} /></Space>)}
              {!returnsCode && (<Space><span>Returns Posting Code:</span><SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} onChange={setNewReturns} /></Space>)}
              <Button onClick={async ()=>{
                try{
                  const settings = [];
                  if (!arControl && newARControl) settings.push({ settingKey:'gl_ar_control_postingcode', settingValue:newARControl });
                  if (!returnsCode && newReturns) settings.push({ settingKey:'gl_ar_returns_postingcode', settingValue:newReturns });
                  if (!settings.length){ message.info('Nothing to save'); return; }
                  const { success } = await request.patch({ entity:'setting/updateManySetting', jsonData:{ settings } });
                  if (success){ message.success('Settings saved'); dispatch(settingsAction.list({ entity:'setting' })); }
                } catch(e){ message.error('Failed to save settings'); }
              }}>Save Settings</Button>
              <Button type='primary' onClick={async ()=>{
                try{
                  const settings = [];
                  if (!arControl && newARControl) settings.push({ settingKey:'gl_ar_control_postingcode', settingValue:newARControl });
                  if (!returnsCode && newReturns) settings.push({ settingKey:'gl_ar_returns_postingcode', settingValue:newReturns });
                  if (settings.length){
                    const { success } = await request.patch({ entity:'setting/updateManySetting', jsonData:{ settings } });
                    if (success){ message.success('Settings saved'); dispatch(settingsAction.list({ entity:'setting' })); }
                  }
                  form.submit();
                } catch(e){ message.error('Failed to save settings'); }
              }}>Save & Post</Button>
            </Space>
          } />
        )}
        <Form form={form} layout='vertical' onFinish={onSubmit}>
          <Form.Item label='Customer Type'>
            <select value={customerModel} onChange={(e)=> { setCustomerModel(e.target.value); setCustomerId(undefined); setOpenInvoices([]); }}>
              <option value='Client'>Customer</option>
              <option value='Company'>Company</option>
              <option value='Person'>Person</option>
            </select>
          </Form.Item>
          <Form.Item label='Customer'>
            {customerModel === 'Client' ? (
              <SelectAsync
                key={'client-selector'}
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
          <Form.Item name='date' label='Date' initialValue={dayjs()}>
            <DatePicker style={{ width:'100%' }} />
          </Form.Item>
          <Form.Item name='amount' label={`Amount (applied total: ${Number(totalApplied).toLocaleString()})`} initialValue={0}>
            <InputNumber min={0} style={{ width:'100%' }} />
          </Form.Item>
          <Form.Item name='description' label='Reason'>
            <Input />
          </Form.Item>
          <Table rowKey={(r)=>r._id} columns={columns} dataSource={openInvoices} loading={loading} pagination={false} title={()=> 'Open Invoices (optional allocation)'} />
          <div style={{ marginTop: 12 }}>
            <Button type='primary' htmlType='submit'>Post Credit</Button>
          </div>
        </Form>
      </Card>
    </ErpLayout>
  );
}
