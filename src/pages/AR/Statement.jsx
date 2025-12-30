import { useState } from 'react';
import { Card, DatePicker, Button, Space, message } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

export default function ARStatement(){
  const [customerModel, setCustomerModel] = useState('Company');
  const [customerId, setCustomerId] = useState();
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  const runPDF = async ()=>{
    try{
      if (!customerId) return message.warning('Select a customer');
      const from = range?.[0]?.format('YYYY-MM-DD');
      const to = range?.[1]?.format('YYYY-MM-DD');
      const auth = storePersist.get('auth');
      const headers = auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
      const url = `${API_BASE_URL}ar/statement/pdf?customerId=${encodeURIComponent(customerId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const resp = await axios.get(url, { responseType:'blob', headers });
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data], { type:'application/pdf' }));
      const a = document.createElement('a'); a.href = blobUrl; a.download = 'ar-statement.pdf'; a.click(); window.URL.revokeObjectURL(blobUrl);
    } catch(e){ message.error('Failed to export PDF'); }
  };

  return (
    <ErpLayout>
      <Card title='Accounts Receivable — Customer Statement' extra={
        <Space>
          <select value={customerModel} onChange={(e)=>{ setCustomerModel(e.target.value); setCustomerId(undefined); }}>
            <option value='Company'>Company</option>
            <option value='Person'>Person</option>
            <option value='Client'>Customer</option>
          </select>
          {customerModel === 'Company' ? (
            <SelectAsync entity={'company'} outputValue={'_id'} displayLabels={['name']} placeholder='Select company' onChange={setCustomerId} />
          ) : customerModel === 'Person' ? (
            <SelectAsync entity={'people'} outputValue={'_id'} displayLabels={['firstname','lastname']} placeholder='Select person' onChange={setCustomerId} />
          ) : (
            <SelectAsync entity={'client'} outputValue={'_id'} displayLabels={['name']} placeholder='Select customer' onChange={setCustomerId} />
          )}
          <DatePicker.RangePicker value={range} onChange={setRange} />
          <Button type='primary' onClick={runPDF}>Export PDF</Button>
        </Space>
      }>
        <p>Select a customer and date range, then Export PDF to download the statement.</p>
      </Card>
    </ErpLayout>
  );
}
