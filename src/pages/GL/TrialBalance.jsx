import { useEffect, useState } from 'react';
import { Button, DatePicker, Table, Card, Space, message } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

function toISO(d){ return d ? dayjs(d).format('YYYY-MM-DD') : ''; }

export default function GLTrialBalance(){
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ debit:0, credit:0 });
  const [loading, setLoading] = useState(false);

  const fetchTB = async () => {
    try {
      setLoading(true);
      const from = toISO(range?.[0]);
      const to = toISO(range?.[1]);
      const { success, result } = await request.get({ entity: `gl/trial-balance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` });
      if (success) {
        setRows(result?.rows || []);
        setTotals(result?.totals || { debit:0, credit:0 });
      }
    } catch (e) {
      message.error('Failed to load trial balance');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchTB(); },[]);

  const exportCSV = () => {
    const header = ['Account Code','Account Name','Debit','Credit'];
    const lines = rows.map(r=>[r.accountCode, r.accountName, r.debit, r.credit]);
    lines.push(['TOTAL','', totals.debit, totals.credit]);
    const csv = [header, ...lines].map(r=> r.map(v=>`"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trial-balance.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      const from = toISO(range?.[0]);
      const to = toISO(range?.[1]);
      const auth = storePersist.get('auth');
      const headers = auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
      const resp = await axios.get(`${API_BASE_URL}gl/trial-balance/pdf?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,{ responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = 'trial-balance.pdf'; a.click(); window.URL.revokeObjectURL(url);
    } catch (e) { message.error('Failed to export PDF'); }
  };

  const columns = [
    { title:'Account Code', dataIndex:'accountCode', key:'code', width:160 },
    { title:'Account Name', dataIndex:'accountName', key:'name' },
    { title:'Debit', dataIndex:'debit', key:'debit', align:'right', render:(v)=> Number(v||0).toLocaleString() },
    { title:'Credit', dataIndex:'credit', key:'credit', align:'right', render:(v)=> Number(v||0).toLocaleString() },
  ];

  return (
    <ErpLayout>
      <Card title='Trial Balance' extra={
        <Space>
          <DatePicker.RangePicker value={range} onChange={(v)=> setRange(v)} />
          <Button onClick={fetchTB} type='primary'>Run</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={exportPDF}>Export PDF</Button>
        </Space>
      }>
        <Table
          rowKey={(r)=> r.accountCode}
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={false}
          footer={() => (
            <div style={{ display:'flex', justifyContent:'flex-end', gap: 24, fontWeight: 600 }}>
              <span>Total Debit: {Number(totals.debit||0).toLocaleString()}</span>
              <span>Total Credit: {Number(totals.credit||0).toLocaleString()}</span>
            </div>
          )}
        />
      </Card>
    </ErpLayout>
  );
}
