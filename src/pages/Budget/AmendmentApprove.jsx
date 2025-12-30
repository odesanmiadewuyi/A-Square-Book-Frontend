import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Button, Typography, Spin } from 'antd';
import { request } from '@/request';

const to2 = (v) => (Number(v || 0)).toFixed(2);

export default function AmendmentApprove() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.read({ entity: 'budgetamendment', id });
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
    await request.update({ entity: 'budgetamendment', id, jsonData: { status } });
    navigate('/budget/amendments');
  };

  const disabled = (record?.status || '') !== 'Draft';

  return (
    <Card title="Approve Budget Amendment" extra={<Space>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Button onClick={fetchRecord}>Refresh</Button>
    </Space>}>
      <Spin spinning={loading}>
        {record ? (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Version">
                {record?.versionId?.code || '-'} {record?.versionId?.name ? `- ${record.versionId.name}` : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Line (GL)">
                {record?.lineId?.glAccount || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Delta Annual">{to2(record?.deltaAnnual)}</Descriptions.Item>
              <Descriptions.Item label="Reason">{record?.reason || '-'}</Descriptions.Item>
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

