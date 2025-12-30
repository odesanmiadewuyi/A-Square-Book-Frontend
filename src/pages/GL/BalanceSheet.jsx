import { useEffect, useState } from 'react';
import { Button, DatePicker, Card, Space, Table, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

export default function GLBalanceSheet(){
  const [asOf, setAsOf] = useState(dayjs());
  const [data, setData] = useState({ assets:[], liabilities:[], equity:[], totals:{ assets:{}, liabilities:{}, equity:{} } });
  const [loading, setLoading] = useState(false);

  const load = async()=>{
    try {
      setLoading(true);
      const { success, result } = await request.get({ entity: `gl/balance-sheet?asOf=${encodeURIComponent(asOf.format('YYYY-MM-DD'))}` });
      if (success) setData(result);
    } catch(e){ message.error('Failed to load balance sheet'); } finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const exportPDF = async ()=>{
    try {
      const auth = storePersist.get('auth');
      const headers = auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
      const resp = await axios.get(`${API_BASE_URL}gl/balance-sheet/pdf?asOf=${encodeURIComponent(asOf.format('YYYY-MM-DD'))}`, { responseType:'blob', headers });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = 'balance-sheet.pdf'; a.click(); window.URL.revokeObjectURL(url);
    } catch(e){ message.error('Failed to export PDF'); }
  };

  const cols = [
    { title:'Code', dataIndex:'accountCode', key:'code', width:160, render:(v,r)=> r.code || r.accountCode },
    { title:'Name', dataIndex:'accountName', key:'name', render:(v,r)=> r.name || r.accountName },
    { title:'Debit', dataIndex:'debit', key:'debit', align:'right', render:(v)=> Number(v||0).toLocaleString() },
    { title:'Credit', dataIndex:'credit', key:'credit', align:'right', render:(v)=> Number(v||0).toLocaleString() },
  ];

  return (
    <ErpLayout>
      <Card title='Balance Sheet' extra={<Space>
        <DatePicker value={asOf} onChange={(v)=> setAsOf(v)} />
        <Button onClick={load} type='primary'>Run</Button>
        <Button onClick={exportPDF}>Export PDF</Button>
      </Space>}>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card size='small' title='Assets'>
              <Table rowKey={(r)=>r.code||r.accountCode} columns={cols} dataSource={data.assets} loading={loading} pagination={false}
                footer={()=> (<div style={{textAlign:'right', fontWeight:600}}>Total Debit: {Number(data?.totals?.assets?.debit||0).toLocaleString()} — Total Credit: {Number(data?.totals?.assets?.credit||0).toLocaleString()}</div>)} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size='small' title='Liabilities'>
              <Table rowKey={(r)=>r.code||r.accountCode} columns={cols} dataSource={data.liabilities} loading={loading} pagination={false}
                footer={()=> (<div style={{textAlign:'right', fontWeight:600}}>Total Debit: {Number(data?.totals?.liabilities?.debit||0).toLocaleString()} — Total Credit: {Number(data?.totals?.liabilities?.credit||0).toLocaleString()}</div>)} />
            </Card>
            <Card size='small' title='Equity' style={{ marginTop: 12 }}>
              <Table rowKey={(r)=>r.code||r.accountCode} columns={cols} dataSource={data.equity} loading={loading} pagination={false}
                footer={()=> (<div style={{textAlign:'right', fontWeight:600}}>Total Debit: {Number(data?.totals?.equity?.debit||0).toLocaleString()} — Total Credit: {Number(data?.totals?.equity?.credit||0).toLocaleString()}</div>)} />
            </Card>
          </Col>
        </Row>
      </Card>
    </ErpLayout>
  );
}

