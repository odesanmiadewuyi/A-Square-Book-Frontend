import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Button, Typography, Spin } from 'antd';
import { request } from '@/request';

const to2 = (v) => (Number(v || 0)).toFixed(2);

export default function TransferApprove() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.read({ entity: 'budgettransfer', id });
      setRecord(res?.result || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const approveReject = async (status) => {
    if (!id) return;
    await request.update({ entity: 'budgettransfer', id, jsonData: { status } });
    navigate('/budget/transfers');
  };

  const disabled = (record?.status || '') !== 'Draft';

  return (
    <Card
      title="Approve Budget Transfer"
      extra={
        <Space>
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={fetchRecord}>Refresh</Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {record ? (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Version">
                {record?.versionId?.code || '-'} {record?.versionId?.name ? `- ${record.versionId.name}` : ''}
              </Descriptions.Item>
              <Descriptions.Item label="From (GL)">
                {record?.fromLineId?.glAccount || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="To (GL)">
                {record?.toLineId?.glAccount || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">{to2(record?.amount)}</Descriptions.Item>
              <Descriptions.Item label="Note">{record?.note || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Typography.Text strong>{record?.status || '-'}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(record?.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{new Date(record?.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>

            <Space style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => approveReject('Approved')} disabled={disabled}>Approve</Button>
              <Button danger onClick={() => approveReject('Rejected')} disabled={disabled}>Reject</Button>
            </Space>
          </>
        ) : (
          <Typography.Text type="secondary">No record found.</Typography.Text>
        )}
      </Spin>
    </Card>
  );
}

