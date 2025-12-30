import { useEffect, useMemo, useState } from 'react';
import { Card, DatePicker, Button, Table, Space, Input, message } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { request } from '@/request';

export default function ARAging(){
  const [asOf, setAsOf] = useState(dayjs().endOf('month'));
  const [bucketsText, setBucketsText] = useState('');
  const [rows, setRows] = useState([]);
  const [buckets, setBuckets] = useState([30,60,90]);
  const [loading, setLoading] = useState(false);

  const fetchAging = async ()=>{
    setLoading(true);
    try{
      const q = `ar/aging?asOf=${encodeURIComponent(asOf.format('YYYY-MM-DD'))}` + (bucketsText?`&buckets=${encodeURIComponent(bucketsText)}`:'');
      const { success, result, meta } = await request.get({ entity: q });
      if (success){ setRows(result||[]); setBuckets(meta?.buckets||[30,60,90]); }
    } catch(e){ message.error('Failed to load aging'); } finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchAging(); },[]);

  const bucketCols = useMemo(()=>{
    const names = ['current'];
    let prev = 0; for (const b of buckets){ names.push(`${prev+1}-${b}`); prev=b; }
    names.push(`>${buckets[buckets.length-1]||90}`);
    return names;
  }, [buckets]);

  const columns = [
    { title:'Customer', dataIndex:['customer','name'], render:(v,r)=> r.customer?.name || `${r.customer?.firstname||''} ${r.customer?.lastname||''}`.trim() || '—' },
    ...bucketCols.map((n)=> ({ title:n, dataIndex:['buckets', n], align:'right', render:(v)=> Number(v||0).toLocaleString() })),
    { title:'Total', dataIndex:'total', align:'right', render:(v)=> Number(v||0).toLocaleString() },
  ];

  const totals = useMemo(()=>{
    const sum = {}; let grand=0;
    for (const r of rows){
      grand += r.total || 0;
      for (const n of bucketCols){ sum[n] = (sum[n]||0) + (r.buckets?.[n]||0); }
    }
    return { sum, grand };
  },[rows, bucketCols]);

  const exportCSV = () => {
    const hdr = ['Customer', ...bucketCols, 'Total'];
    const lines = rows.map(r=>{
      const c = r.customer?.name || `${r.customer?.firstname||''} ${r.customer?.lastname||''}`.trim();
      const vals = bucketCols.map(n=> r.buckets?.[n]||0);
      return [c, ...vals, r.total||0];
    });
    lines.push(['TOTAL', ...bucketCols.map(n=> totals.sum[n]||0), totals.grand]);
    const csv = [hdr, ...lines].map(a=> a.map(x=>`"${(x??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='ar-aging.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <ErpLayout>
      <Card title='Accounts Receivable — Aging' extra={
        <Space>
          <DatePicker value={asOf} onChange={setAsOf} />
          <Input style={{width:240}} placeholder='[30,60,90] (optional)' value={bucketsText} onChange={(e)=> setBucketsText(e.target.value)} />
          <Button type='primary' onClick={fetchAging}>Run</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={async ()=>{
            try{
              const url = `ar/aging/pdf?asOf=${encodeURIComponent(asOf.format('YYYY-MM-DD'))}` + (bucketsText?`&buckets=${encodeURIComponent(bucketsText)}`:'');
              const { API_BASE_URL } = await import('@/config/serverApiConfig');
              const axios = (await import('axios')).default; const storePersist = (await import('@/redux/storePersist')).default;
              const auth = storePersist.get('auth'); const headers = auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
              const resp = await axios.get(`${API_BASE_URL}${url}`, { responseType:'blob', headers });
              const blobUrl = window.URL.createObjectURL(new Blob([resp.data], { type:'application/pdf' }));
              const a=document.createElement('a'); a.href=blobUrl; a.download='ar-aging.pdf'; a.click(); window.URL.revokeObjectURL(blobUrl);
            } catch(e){ message.error('Failed to export PDF'); }
          }}>Export PDF</Button>
        </Space>
      }>
        <Table rowKey={(r)=> r.customer?._id || Math.random()} columns={columns} dataSource={rows} loading={loading} pagination={false}
          footer={()=> (
            <div style={{ display:'flex', justifyContent:'flex-end', gap:24, fontWeight:600 }}>
              <span>Total: {Number(totals.grand||0).toLocaleString()}</span>
            </div>
          )}
        />
      </Card>
    </ErpLayout>
  );
}
