import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Space, Button, DatePicker, message, Upload, Descriptions, Modal, Tooltip } from 'antd';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/settings/selectors';
import dayjs from 'dayjs';

// Minimal CSV parser supporting quoted fields and delimiter detection (',' or ';')
function parseCSV(text){
  if (!text) return [];
  const firstLine = text.split(/\r?\n/)[0] || '';
  const delimiter = (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ',';
  const rows = [];
  let i=0, field='', inQuotes=false, row=[];
  const pushField=()=>{ row.push(field); field=''; };
  const pushRow=(arr)=>{ rows.push(arr); };
  for (const ch of text){
    if (ch === '\"'){
      if (inQuotes && text[i+1] === '\"'){ field+='\"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes){ pushField(); }
    else if ((ch === '\n' || ch === '\r') && !inQuotes){ if (field!=='' || row.length){ pushField(); pushRow(row); row=[]; } }
    else { field += ch; }
    i++;
  }
  if (field!=='' || row.length){ pushField(); pushRow(row); }
  // Normalize rows
  const header = (rows.shift() || []).map(h=> (h||'').trim().toLowerCase());
  const idx = (k)=> header.indexOf(k);
  return rows
    .filter(r=> r.some(x=> (x||'').toString().trim()!==''))
    .map(cols=>({
      date: cols[idx('date')] || cols[0],
      description: cols[idx('description')] || cols[1] || '',
      debit: parseFloat(cols[idx('debit')] || 0) || 0,
      credit: parseFloat(cols[idx('credit')] || 0) || 0,
      reference: cols[idx('reference')] || '',
    }));
}

export default function BankReconcile(){
  const [bankId, setBankId] = useState();
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [outstanding, setOutstanding] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ statement:0, ledger:0 });
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const amountOf = (r)=> (parseFloat(r?.debit)||0) - (parseFloat(r?.credit)||0);
  const { result: settingsResult } = useSelector(selectSettings);
  const defaultPost = (settingsResult?.gl_settings?.gl_reconcile_default_bank_charge_postingcode || '').toString().trim();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postAccountCode, setPostAccountCode] = useState('');
  const [defaultPostLabel, setDefaultPostLabel] = useState('');
  const [defaultPostId, setDefaultPostId] = useState('');
  const [bankPostLabel, setBankPostLabel] = useState('');
  const [bankPostId, setBankPostId] = useState('');

  useEffect(()=>{
    (async ()=>{
      try {
        if (defaultPost) {
          const { success, result } = await request.filter({ entity: 'postingaccount', options: { filter: 'postingcode', equal: defaultPost } });
          if (success && Array.isArray(result) && result[0]) {
            const pa = result[0];
            setDefaultPostId(pa._id);
            const cls = (pa.classCode || '').toString();
            const side = cls === '01' || cls === '05' ? 'Debit' : (cls === '02' || cls === '03' || cls === '04' ? 'Credit' : '');
            const classLabel = cls === '01' ? 'Asset' : cls === '02' ? 'Liability' : cls === '03' ? 'Equity' : cls === '04' ? 'Income' : cls === '05' ? 'Expense' : '';
            const tag = classLabel ? `${classLabel} (${side})` : '';
            setDefaultPostLabel(`${defaultPost} — ${pa.name || ''}${tag ? ' — ' + tag : ''}`);
          } else { setDefaultPostLabel(defaultPost); setDefaultPostId(''); }
        } else setDefaultPostLabel('');
      } catch(e){ setDefaultPostLabel(defaultPost); }
    })();
  }, [defaultPost]);

  const fetchSummary = async ()=>{
    if (!bankId) return;
    setLoading(true);
    const from = range?.[0]?.format('YYYY-MM-DD');
    const to = range?.[1]?.format('YYYY-MM-DD');
    const { success, result } = await request.get({ entity: `bank/reconcile/summary?bankId=${bankId}&from=${from}&to=${to}` });
    if (success){ setOutstanding(result.outstanding||[]); setLedger(result.ledger||[]); setTotals(result.totals||{ statement:0, ledger:0 }); }
    setLoading(false);
  };

  useEffect(()=>{ fetchSummary(); }, [bankId]);

  // Load bank GL posting account label when bank changes
  useEffect(()=>{
    (async ()=>{
      try {
        if (!bankId) { setBankPostLabel(''); return; }
        const { success, result } = await request.read({ entity: 'bank', id: bankId });
        if (success && result?.postingAccountCode){
          const code = (result.postingAccountCode||'').toString();
          const r2 = await request.filter({ entity: 'postingaccount', options: { filter: 'postingcode', equal: code } });
          if (r2.success && Array.isArray(r2.result) && r2.result[0]){
            const pa = r2.result[0];
            setBankPostId(pa._id);
            const cls = (pa.classCode||'').toString();
            const side = cls === '01' || cls === '05' ? 'Debit' : (cls === '02' || cls === '03' || cls === '04' ? 'Credit' : '');
            const classLabel = cls === '01' ? 'Asset' : cls === '02' ? 'Liability' : cls === '03' ? 'Equity' : cls === '04' ? 'Income' : cls === '05' ? 'Expense' : '';
            const tag = classLabel ? `${classLabel} (${side})` : '';
            setBankPostLabel(`${code} — ${pa.name||''}${tag ? ' — ' + tag : ''}`);
          } else { setBankPostLabel(code); setBankPostId(''); }
        } else setBankPostLabel('');
      } catch(e){ setBankPostLabel(''); }
    })();
  }, [bankId]);

  // Auto-suggest a ledger line when statement selected (same amount, closest date within ±3 days)
  useEffect(()=>{
    if (!selectedStatement || !ledger?.length) return;
    const amt = amountOf(selectedStatement);
    if (!amt) return;
    const sDate = new Date(selectedStatement.date || selectedStatement.Date || Date.now());
    let best=null, bestScore=Number.MAX_SAFE_INTEGER;
    for (const l of ledger){
      const lAmt = amountOf(l);
      if (Math.abs(lAmt - amt) < 0.0001){
        const d = new Date(l.date || Date.now());
        const days = Math.abs((d - sDate)/(1000*60*60*24));
        const score = days;
        if (score < bestScore && days <= 3){ best = l; bestScore = score; }
      }
    }
    if (best) setSelectedLedger(best);
  }, [selectedStatement, ledger]);

  const match = async ()=>{
    if (!selectedStatement || !selectedLedger) return message.warning('Select a statement line and a ledger line');
    const { success } = await request.post({ entity: 'bank/reconcile/match', jsonData: { statementId: selectedStatement._id, journalLineId: selectedLedger._id } });
    if (success){ message.success('Matched'); setSelectedLedger(null); setSelectedStatement(null); fetchSummary(); }
  };

  const markCleared = async ()=>{
    if (!selectedStatement) return message.warning('Select a statement line');
    const { success } = await request.post({ entity: 'bank/reconcile/mark-cleared', jsonData: { statementId: selectedStatement._id } });
    if (success){ message.success('Marked cleared'); setSelectedStatement(null); fetchSummary(); }
  };

  const unmatch = async ()=>{
    if (!selectedStatement) return message.warning('Select a statement line');
    const { success } = await request.post({ entity: 'bank/reconcile/unmatch', jsonData: { statementId: selectedStatement._id } });
    if (success){ message.success('Unmatched'); setSelectedStatement(null); fetchSummary(); }
  };

  const importCSV = async (text)=>{
    if (!bankId) return message.warning('Select a bank first');
    const rows = parseCSV(text);
    if (!rows.length) return message.warning('No rows found');
    const { success, result } = await request.post({ entity: 'bank/reconcile/import', jsonData: { bankId, rows } });
    if (success){ message.success(`Imported ${result.inserted} rows`); fetchSummary(); }
  };

  const autoSuggest = async ()=>{
    if (!bankId) return message.warning('Select a bank first');
    const from = range?.[0]?.format('YYYY-MM-DD');
    const to = range?.[1]?.format('YYYY-MM-DD');
    const { success, result } = await request.get({ entity: `bank/reconcile/auto-suggest?bankId=${bankId}&from=${from}&to=${to}` });
    if (success){
      if (!result.matches?.length) return message.info('No suggestions found');
      const { success: ok, result: r2 } = await request.post({ entity: 'bank/reconcile/match-batch', jsonData: { pairs: result.matches } });
      if (ok){ message.success(`Auto-matched ${r2.matched} items`); fetchSummary(); }
    }
  };

  const postFromStatement = async ()=>{
    if (!selectedStatement) return message.warning('Select a statement line');
    let postingAccountCode = defaultPost;
    if (!postingAccountCode){
      setPostModalOpen(true);
      return;
    }
    const payload = { statementId: selectedStatement._id, postingAccountCode };
    const { success, message: msg } = await request.post({ entity: 'bank/reconcile/propose-post', jsonData: payload });
    if (success){ message.success(msg || 'Posted'); setSelectedStatement(null); fetchSummary(); }
  };

  const colsStmt = [
    { title:'Date', dataIndex:'date', render:(v)=> (v? new Date(v).toISOString().slice(0,10):'') },
    { title:'Description', dataIndex:'description' },
    { title:'Debit', dataIndex:'debit', align:'right' },
    { title:'Credit', dataIndex:'credit', align:'right' },
  ];
  const colsLedg = [
    { title:'Date', dataIndex:'date', render:(v)=> (v? new Date(v).toISOString().slice(0,10):'') },
    { title:'Description', dataIndex:'description' },
    { title:'Debit', dataIndex:'debit', align:'right' },
    { title:'Credit', dataIndex:'credit', align:'right' },
  ];

  return (
    <ErpLayout>
      <Card title='Bank Reconciliation' extra={
        <Space>
          <SelectAsync entity={'bank'} outputValue={'_id'} displayLabels={['name','accountNumber']} placeholder='Select bank' onChange={setBankId} />
          <DatePicker.RangePicker value={range} onChange={setRange} />
          <Button onClick={fetchSummary} type='primary'>Load</Button>
          <Upload beforeUpload={(file)=> { const reader = new FileReader(); reader.onload = (e)=> importCSV(e.target.result); reader.readAsText(file); return false; } } showUploadList={false}>
            <Button>Import CSV</Button>
          </Upload>
          <Button onClick={()=>{
            const header = ['date','description','debit','credit','reference'];
            const example = [dayjs().format('YYYY-MM-DD'),'Opening deposit', '1000', '0', 'REF001'];
            const csv = header.join(',')+'\n'+example.join(',')+'\n';
            const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bank-statement-template.csv'; a.click(); URL.revokeObjectURL(url);
          }}>Download Template</Button>
          <Button onClick={match} disabled={!selectedLedger || !selectedStatement}>Match</Button>
          <Button onClick={markCleared} disabled={!selectedStatement}>Mark Cleared</Button>
          <Button onClick={unmatch} disabled={!selectedStatement}>Unmatch</Button>
          <Tooltip title={defaultPost ? `Will use default: ${defaultPostLabel}` : 'No default set; you will be prompted to choose an account'}>
            <Button onClick={postFromStatement} disabled={!selectedStatement}>Create Ledger Entry</Button>
          </Tooltip>
          <Button
            onClick={()=>{
              if (!selectedStatement) { message.warning('Select a statement line'); return; }
              setPostModalOpen(true);
            }}
            disabled={!selectedStatement}
          >
            Override Account
          </Button>
          <Button onClick={autoSuggest}>Auto Match All</Button>
        </Space>
      }>
        <Descriptions bordered size='small' style={{ marginBottom: 12 }}>
          <Descriptions.Item label='Statement Δ (sum debit-credit)' span={1}>{Number(totals.statement||0).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label='Ledger Δ (sum debit-credit)' span={1}>{Number(totals.ledger||0).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label='Difference' span={1}>{Number((totals.statement||0) - (totals.ledger||0)).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label='Bank GL Account' span={3}>
            <Space>
              <span>{bankPostLabel || '-'}</span>
              {bankPostId && (
                <a href={`/postingaccount/update/${bankPostId}`} target='_blank' rel='noreferrer'>Edit Posting</a>
              )}
              {bankId && (
                <a href={`/bank/update/${bankId}`} target='_blank' rel='noreferrer'>Edit Bank</a>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label='Default Posting Code' span={3}>
            <Space>
              <span>{defaultPostLabel || 'Not set (configure in GL Settings)'}</span>
              {defaultPostId && (
                <a href={`/postingaccount/update/${defaultPostId}`} target='_blank' rel='noreferrer'>Edit Default</a>
              )}
              <a href={'/settings/edit/gl_settings'} target='_blank' rel='noreferrer'>GL Settings</a>
            </Space>
          </Descriptions.Item>
        </Descriptions>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card size='small' title='Statement (Outstanding)'>
              <Table rowKey={(r)=> r._id} columns={colsStmt} dataSource={outstanding} loading={loading} pagination={false}
                onRow={(r)=> ({ onClick: ()=> setSelectedStatement(r), style: { cursor:'pointer', background: selectedStatement?._id===r._id?'#e6f7ff':undefined }})} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size='small' title='Ledger (Posted)'>
              <Table rowKey={(r)=> r._id} columns={colsLedg} dataSource={ledger} loading={loading} pagination={false}
                onRow={(r)=> ({ onClick: ()=> setSelectedLedger(r), style: { cursor:'pointer', background: selectedLedger?._id===r._id?'#e6f7ff':undefined }})} />
            </Card>
          </Col>
        </Row>
      </Card>
      <Modal
        title='Choose Posting Account'
        open={postModalOpen}
        onCancel={()=>{ setPostModalOpen(false); setPostAccountCode(''); }}
        onOk={async ()=>{
          if (!postAccountCode){ message.warning('Select a posting account'); return; }
          if (!selectedStatement){ setPostModalOpen(false); return; }
          const payload = { statementId: selectedStatement._id, postingAccountCode: postAccountCode };
          const { success, message: msg } = await request.post({ entity: 'bank/reconcile/propose-post', jsonData: payload });
          if (success){ message.success(msg || 'Posted'); setSelectedStatement(null); fetchSummary(); }
          setPostModalOpen(false); setPostAccountCode('');
        }}
      >
        <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select posting account' onChange={setPostAccountCode} />
      </Modal>
    </ErpLayout>
  );
}
