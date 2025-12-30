import { useState } from 'react';
import { Card, DatePicker, Button, Space, Descriptions, message } from 'antd';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import SelectAsync from '@/components/SelectAsync';
// duplicate import removed

export default function ARControlReconcile(){
  const [asOf, setAsOf] = useState(dayjs());
  const [data, setData] = useState(null);
  const [needControl, setNeedControl] = useState(false);
  const [controlCode, setControlCode] = useState('');

  const run = async ()=>{
    try{
      const q = `ar/recon/control?asOf=${encodeURIComponent(asOf.format('YYYY-MM-DD'))}`;
      const { success, result, message: msg } = await request.get({ entity: q });
      if (success) { setData(result); setNeedControl(false); }
      else setData(null);
    } catch(e){
      // If backend enforces control code present, show quick configure widget
      setNeedControl(true);
      setData(null);
      message.error('AR control posting code not configured. Please set it below.');
    }
  };

  return (
    <ErpLayout>
      <Card title='AR vs GL Control Reconciliation' extra={
        <Space>
          <DatePicker value={asOf} onChange={setAsOf} />
          <Button type='primary' onClick={run}>Run</Button>
        </Space>
      }>
        {needControl && (
          <div style={{ marginBottom: 12 }}>
            <Space>
              <span>Set AR Control Posting Code:</span>
              <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select AR control account' onChange={setControlCode} />
              <Button onClick={async ()=>{
                if (!controlCode) { message.warning('Select a posting code'); return; }
                try{
                  const payload = { settings: [{ settingKey:'gl_ar_control_postingcode', settingValue: controlCode }] };
                  const { success } = await request.patch({ entity: 'setting/updateManySetting', jsonData: payload });
                  if (success) { message.success('Saved AR control posting code'); setNeedControl(false); setControlCode(''); run(); }
                } catch(err){ message.error('Failed to save setting'); }
              }}>Save</Button>
            </Space>
          </div>
        )}
        {data && (
          <Descriptions bordered size='small'>
            <Descriptions.Item label='As Of' span={3}>{new Date(data.asOf).toISOString().slice(0,10)}</Descriptions.Item>
            <Descriptions.Item label='AR Subledger (sum of ARTransactions)' span={3}>{Number(data.ar||0).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={`GL Control (${data.controlPostingCode})`} span={3}>{Number(data.gl||0).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label='Difference (GL - AR)' span={3}><span style={{ color: Math.abs((data.difference||0))<0.01 ? 'green' : 'red' }}>{Number(data.difference||0).toLocaleString()}</span></Descriptions.Item>
          </Descriptions>
        )}
        {!data && <p>Choose a date and Run to compare AR subledger vs GL control account.</p>}
      </Card>
    </ErpLayout>
  );
}
