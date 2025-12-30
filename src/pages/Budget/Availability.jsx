import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Space, Button, Statistic, Input, message, Table } from 'antd';
import { ErpLayout } from '@/layout';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

export default function BudgetAvailability() {
  const [versionId, setVersionId] = useState();
  const [departmentId, setDepartmentId] = useState();
  const [glAccount, setGlAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ revisedAnnual: 0, commitmentsYTD: 0, actualsYTD: 0, availableYTD: 0, linesCount: 0 });
  const [rows, setRows] = useState([]);

  const canRun = !!versionId;

  const run = async () => {
    if (!versionId) {
      message.warning('Select a Version');
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('versionId', versionId);
      if (departmentId) params.set('departmentId', departmentId);
      if (glAccount) params.set('glAccount', glAccount);
      const { success, result, message: msg } = await request.get({ entity: `budget/availability?${params.toString()}` });
      if (success) {
        setData(result || {});
      } else {
        message.error(msg || 'Failed to load availability');
      }
      // load line breakdown
      try {
        const { success: ok, result: items } = await request.get({ entity: `budget/availability/lines?${params.toString()}` });
        if (ok) setRows(Array.isArray(items) ? items : items?.result || []);
      } catch (_) {}
    } catch (e) {
      message.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Optional: run once if a version is preselected by default (none for now)
  useEffect(() => { /* noop */ }, []);

  return (
    <ErpLayout>
      <Card
        title={'Budget Availability'}
        extra={
          <Space>
            <div style={{ minWidth: 240 }}>
              <SelectAsync
                entity={'budgetversion'}
                displayLabels={['code', 'name']}
                outputValue={'_id'}
                placeholder={'Select Version'}
                value={versionId}
                onChange={setVersionId}
              />
            </div>
            <div style={{ minWidth: 220 }}>
              <SelectAsync
                entity={'department'}
                displayLabels={['name']}
                outputValue={'_id'}
                placeholder={'Department (optional)'}
                value={departmentId}
                onChange={setDepartmentId}
              />
            </div>
            <Input
              style={{ width: 220 }}
              placeholder={'GL Account (optional)'}
              value={glAccount}
              onChange={(e) => setGlAccount(e.target.value)}
              allowClear
            />
            <Button type={'primary'} onClick={run} loading={loading} disabled={!canRun}>
              Run
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size={'small'}>
              <Statistic title={'Revised Annual'} value={Number(data?.revisedAnnual || 0)} precision={2} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size={'small'}>
              <Statistic title={'Commitments YTD'} value={Number(data?.commitmentsYTD || 0)} precision={2} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size={'small'}>
              <Statistic title={'Actuals YTD'} value={Number(data?.actualsYTD || 0)} precision={2} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size={'small'}>
              <Statistic title={'Available YTD'} value={Number(data?.availableYTD || 0)} precision={2} />
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Card size={'small'}>
            <Space size={'large'}>
              <span>
                Lines matched: <strong>{Number(data?.linesCount || 0).toLocaleString()}</strong>
              </span>
              {departmentId ? (
                <span>
                  Department filter: <strong>{departmentId}</strong>
                </span>
              ) : null}
              {glAccount ? (
                <span>
                  GL filter: <strong>{glAccount}</strong>
                </span>
              ) : null}
            </Space>
          </Card>
        </div>

        <div style={{ marginTop: 12 }}>
          <Table
            size={'small'}
            rowKey={(r) => r._id}
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Department', dataIndex: ['departmentId','name'], render: (_, r)=> r?.departmentId?.name || '-' },
              { title: 'GL', dataIndex: 'glAccount' },
              { title: 'Annual', dataIndex: 'baseAnnual', align:'right', render: (v)=> Number(v||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }) },
              { title: 'Amendments', dataIndex: 'amdAnnual', align:'right', render: (v)=> Number(v||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }) },
              { title: 'Transfer In', dataIndex: 'transferIn', align:'right', render: (v)=> Number(v||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }) },
              { title: 'Transfer Out', dataIndex: 'transferOut', align:'right', render: (v)=> Number(v||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }) },
              { title: 'Revised', dataIndex: 'revisedAnnual', align:'right', render: (v)=> Number(v||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }) },
            ]}
          />
        </div>
      </Card>
    </ErpLayout>
  );
}
