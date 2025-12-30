import React, { useMemo, useState, useEffect } from 'react';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { Form, InputNumber, Input, Row, Col, Space, Button, Divider, Typography, Descriptions, Tag, Card } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { Link, useNavigate } from 'react-router-dom';

function LineForm(){
  const form = Form.useFormInstance();
  const monthLabels = useMemo(() => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], []);
  const [posting, setPosting] = useState(null);
  const [actuals, setActuals] = useState(null);
  const [loadingActuals, setLoadingActuals] = useState(false);
  const fyWatch = Form.useWatch('fiscalYear', form);
  const glWatch = Form.useWatch('glAccount', form);

  // Load monthly actuals once fiscalYear + postingcode are selected
  useEffect(() => {
    const fy = fyWatch; const pc = glWatch;
    if (!fy || !pc) { setActuals(null); return; }
    (async () => {
      try {
        setLoadingActuals(true);
        const resp = await request.get({ entity: `generalledger/monthly?postingcode=${pc}&fiscalYear=${fy}&status=posted` });
        if (resp?.success) setActuals(resp.result);
      } catch (_) { /* ignore */ }
      finally { setLoadingActuals(false); }
    })();
  }, [fyWatch, glWatch]);

  const evenSpread = () => {
    const annual = Number(form.getFieldValue('annualAmount') || 0);
    const base = Math.floor((annual / 12) * 100) / 100; // 2d.p.
    const remainder = Math.round((annual - base * 12) * 100) / 100;
    const m = {};
    for (let i = 1; i <= 12; i++) m[`m${i}`] = base;
    // add remainder to last month to match annual precisely
    m['m12'] = Math.round((m['m12'] + remainder) * 100) / 100;
    form.setFieldsValue({ m });
  };
  const clearMonths = () => {
    const m = {}; for (let i = 1; i <= 12; i++) m[`m${i}`] = 0; form.setFieldsValue({ m });
  };
  const sumMonthsToAnnual = () => {
    const m = form.getFieldValue('m') || {}; let t = 0; for (let i = 1; i <= 12; i++) t += Number(m[`m${i}`] || 0);
    form.setFieldsValue({ annualAmount: Math.round(t * 100) / 100 });
  };

  return (
    <>
      <Form.Item name='versionId' label='Version' rules={[{ required:true }]}> 
        {/**
         * Only allow adding lines to versions that are Approved.
         * Locked versions are read-only, so filtering for Locked here
         * leads to an empty list in typical workflows. Show Approved instead.
         */}
        <SelectAsync
          entity={'budgetversion'}
          outputValue={'_id'}
          displayLabels={['code','name']}
          placeholder={'Select Version'}
          listOptions={{ items: 100, filter: 'status', equal: 'Approved' }}
        />
      </Form.Item>
      <Form.Item name='fiscalYear' label='Fiscal Year' rules={[{ required:true }]}> 
        <SelectAsync
          entity={'fiscalyear'}
          outputValue={'_id'}
          displayLabels={['fiscalYear']}
          placeholder={'Select Fiscal Year'}
          listOptions={{ items: 100, fields: 'fiscalYear' }}
        />
      </Form.Item>
      <Form.Item name='departmentId' label='Department' rules={[{ required:true }]}> 
        <SelectAsync entity={'department'} outputValue={'_id'} displayLabels={['name']} placeholder={'Select Department'} />
      </Form.Item>
      <Form.Item name='glAccount' label='GL Account' rules={[{ required:true }]}> 
        <SelectAsync
          entity={'postingaccount'}
          outputValue={'postingcode'}
          displayLabels={['postingcode','name']}
          placeholder={'Select GL Account'}
          listOptions={{ items: 100, fields: 'postingcode,name' }}
          onSelectRecord={setPosting}
        />
      </Form.Item>
      {posting && (
        <Card size='small' style={{ marginTop: -8, marginBottom: 8 }} extra={<Link to={`/gl/postings/read/${posting._id}`}>View posting</Link>}>
          <Descriptions size='small' column={2} title={posting.name || 'Posting Account'}>
            <Descriptions.Item label='Posting Code'>{posting.postingcode}</Descriptions.Item>
            <Descriptions.Item label='Sub-Group'>{posting.subgroupcode}</Descriptions.Item>
            <Descriptions.Item label='Class'>{posting.classCode}</Descriptions.Item>
            <Descriptions.Item label='Group'>{posting.groupCode}</Descriptions.Item>
            <Descriptions.Item label='Sub'>{posting.code}</Descriptions.Item>
            <Descriptions.Item label='Enabled'>
              <Tag color={posting.enabled ? 'green' : 'red'}>{posting.enabled ? 'Enabled' : 'Disabled'}</Tag>
            </Descriptions.Item>
            {posting.description ? (
              <Descriptions.Item label='Description' span={2}>{posting.description}</Descriptions.Item>
            ) : null}
          </Descriptions>
        </Card>
      )}
      {actuals && (
        <Card size='small' loading={loadingActuals} style={{ marginTop: -8, marginBottom: 8 }}>
          <Typography.Text strong>Actuals (FY {actuals.fiscalYear})</Typography.Text>
          <Row gutter={[12, 0]} style={{ marginTop: 8 }}>
            {Array.from({ length: 12 }).map((_, idx) => {
              const rec = actuals.months[idx] || { net: 0 };
              return (
                <Col span={8} key={idx}>
                  <div style={{ fontSize: 12, color: '#888' }}>{monthLabels[idx]}</div>
                  <div style={{ fontWeight: 600 }}>{Number(rec.net || 0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                </Col>
              );
            })}
          </Row>
          <div style={{ marginTop: 8, color: '#666' }}>
            Total: {Number(actuals?.totals?.net || 0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}
          </div>
        </Card>
      )}
      <Form.Item name='annualAmount' label='Annual Amount' rules={[{ required:true }]}> 
        <InputNumber min={0} step={0.01} precision={2} style={{ width:'100%' }} />
      </Form.Item>

      <Divider style={{ marginTop: 0 }} />
      <Space style={{ marginBottom: 8 }} wrap>
        <Typography.Text strong>Monthly Allocation</Typography.Text>
        <Button size='small' onClick={evenSpread}>Evenly distribute</Button>
        <Button size='small' onClick={sumMonthsToAnnual}>Sum months → Annual</Button>
        <Button size='small' onClick={clearMonths}>Clear</Button>
      </Space>
      <Form.Item shouldUpdate noStyle>
        {() => {
          const m = form.getFieldValue('m') || {}; let t = 0; for (let i = 1; i <= 12; i++) t += Number(m[`m${i}`] || 0);
          const annual = Number(form.getFieldValue('annualAmount') || 0);
          const diff = Math.round((annual - t) * 100) / 100;
          return (
            <Typography.Text type={diff === 0 ? 'secondary' : 'warning'} style={{ marginBottom: 8, display:'block' }}>
              Sum of months: {t.toFixed(2)} {diff !== 0 ? `(diff vs annual: ${diff.toFixed(2)})` : ''}
            </Typography.Text>
          );
        }}
      </Form.Item>
      <Row gutter={[12, 0]}>
        {Array.from({ length: 12 }).map((_, idx)=> (
          <Col span={8} key={idx}>
            <Form.Item name={['m', `m${idx+1}`]} label={monthLabels[idx]}> 
              <InputNumber min={0} step={0.01} precision={2} style={{ width:'100%' }} />
            </Form.Item>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default function BudgetLines(){
  const entity = 'budgetline';
  const navigate = useNavigate();
  const Labels = { PANEL_TITLE:'Budget Lines', DATATABLE_TITLE:'Budget Lines', ADD_NEW_ENTITY:'Add Budget Line', ENTITY_NAME:'Budget Line' };
  const dataTableColumns = [
    { title:'Version', dataIndex:['versionId','code'], render:(_,r)=> r?.versionId?.code || '-' },
    { title:'FY', dataIndex:'fiscalYear' },
    { title:'Department', dataIndex:['departmentId','name'], render:(_,r)=> r?.departmentId?.name || '-' },
    { title:'GL', dataIndex:'glAccount' },
    { title:'Annual', dataIndex:'annualAmount', onCell:()=>({style:{textAlign:'right'}}), render:(v)=> (Number(v||0)).toFixed(2) },
  ];
  // Fields shown in the right drawer when clicking a row
  const readColumns = [
    { title:'Version', dataIndex:['versionId','code'] },
    { title:'Version Name', dataIndex:['versionId','name'] },
    { title:'Fiscal Year', dataIndex:'fiscalYear' },
    { title:'Department', dataIndex:['departmentId','name'] },
    { title:'GL Account', dataIndex:'glAccount' },
    { title:'Annual Amount', dataIndex:'annualAmount' },
    { title:'Jan', dataIndex:['m','m1'] },
    { title:'Feb', dataIndex:['m','m2'] },
    { title:'Mar', dataIndex:['m','m3'] },
    { title:'Apr', dataIndex:['m','m4'] },
    { title:'May', dataIndex:['m','m5'] },
    { title:'Jun', dataIndex:['m','m6'] },
    { title:'Jul', dataIndex:['m','m7'] },
    { title:'Aug', dataIndex:['m','m8'] },
    { title:'Sep', dataIndex:['m','m9'] },
    { title:'Oct', dataIndex:['m','m10'] },
    { title:'Nov', dataIndex:['m','m11'] },
    { title:'Dec', dataIndex:['m','m12'] },
  ];
  const searchConfig = { entity, displayLabels:['glAccount'], searchFields:'glAccount' };
  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    readColumns,
    searchConfig,
    panelWidth: 640,
    openOnRowClick: true,
    headerExtras: () => [
      <Button key="budget-lines-print" onClick={() => navigate('/reports/budgetline/list?autoload=1&print=1')}>
        Print List
      </Button>,
    ],
  };
  return <CrudModule config={config} createForm={<LineForm />} updateForm={<LineForm />} />;
}
