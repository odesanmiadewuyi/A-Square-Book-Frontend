import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Input, Tag, message, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { leadService } from '@/request/leadService';

import LeadForm from './LeadForm';

const STATUS_COLORS = {
  New: 'blue',
  'In Negotiation': 'gold',
  Won: 'green',
  Lost: 'volcano',
  Canceled: 'red',
  'On Hold': 'purple',
};

const SOURCE_COLORS = {
  Sales: 'blue',
  Advertising: 'green',
  'Social Media': 'purple',
  Website: 'cyan',
  Referral: 'gold',
  Other: 'default',
};

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const buildTablePagination = (pagination) => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
});

const LeadList = () => {
  const translate = useLanguage();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leadService.getLeads({
        page: params.page,
        limit: params.limit,
        search: params.search,
      });

      if (response?.success) {
        setLeads(response.data || []);
        const serverPagination = response.pagination || {};
        setPagination({
          current: serverPagination.currentPage || params.page,
          pageSize: params.limit,
          total: serverPagination.totalRecords || 0,
        });
      } else {
        message.error(response?.message || 'Unable to fetch leads');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || 'Unable to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((current) => ({ ...current, page: 1, search: searchValue.trim() }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const openCreateDrawer = useCallback(() => {
    setEditingLead(null);
    setDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((lead) => {
    setEditingLead(lead);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingLead(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeDrawer();
    fetchLeads();
  }, [closeDrawer, fetchLeads]);

  const handleTableChange = (tablePagination) => {
    setPagination((prev) => ({
      ...prev,
      current: tablePagination.current,
      pageSize: tablePagination.pageSize,
    }));

    setParams((current) => ({
      ...current,
      page: tablePagination.current,
      limit: tablePagination.pageSize,
    }));
  };

  const handleDelete = useCallback(
    async (leadId) => {
      setDeletingId(leadId);
      try {
        const response = await leadService.deleteLead(leadId);
        if (response?.success) {
          message.success(response.message || 'Lead deleted successfully');
          fetchLeads();
        } else {
          message.error(response?.message || 'Unable to delete lead');
        }
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        message.error(apiMessage || 'Unable to delete lead');
      } finally {
        setDeletingId(null);
      }
    },
    [fetchLeads]
  );

  const handleRefresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleViewReceipt = useCallback(() => {
    navigate('/reports/arreceipt/list?autoload=1');
  }, [navigate]);

  const columns = useMemo(
    () => [
      {
        title: translate('branch'),
        dataIndex: 'branch',
        key: 'branch',
        render: (value) => value || '-',
      },
      {
        title: translate('type'),
        dataIndex: 'type',
        key: 'type',
        render: (value) => <Tag>{value || '-'}</Tag>,
      },
      {
        title: translate('name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: translate('status'),
        dataIndex: 'status',
        key: 'status',
        render: (value) => <Tag color={STATUS_COLORS[value] || 'default'}>{value || '-'}</Tag>,
      },
      {
        title: translate('source'),
        dataIndex: 'source',
        key: 'source',
        render: (value) => <Tag color={SOURCE_COLORS[value] || 'default'}>{value || '-'}</Tag>,
      },
      {
        title: translate('country'),
        dataIndex: 'country',
        key: 'country',
        render: (value) => value || '-',
      },
      {
        title: translate('phone'),
        dataIndex: 'phone',
        key: 'phone',
        render: (value) => (value ? <Tag color="green">{value}</Tag> : '-'),
      },
      {
        title: translate('email'),
        dataIndex: 'email',
        key: 'email',
        render: (value) => (value ? <a href={`mailto:${value}`}>{value}</a> : '-'),
      },
      {
        title: translate('project'),
        dataIndex: 'project',
        key: 'project',
        ellipsis: true,
        render: (value) => value || '-',
      },
      {
        title: translate('actions') || 'Actions',
        key: 'actions',
        fixed: 'right',
        render: (_, record) => (
          <Space size="middle">
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditDrawer(record)}>
              {translate('edit')}
            </Button>
            <Popconfirm
              title={translate('delete_confirmation') || 'Delete this lead?'}
              okText={translate('delete')}
              cancelText={translate('cancel')}
              okButtonProps={{ loading: deletingId === record._id }}
              onConfirm={() => handleDelete(record._id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {translate('delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deletingId, handleDelete, openEditDrawer, translate]
  );

  return (
    <>
      <Card
        title={translate('lead_list')}
        extra={
          <Space>
            <Button onClick={handleViewReceipt}>
              {translate('View Receipt') || 'View Receipt'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
              {translate('add_new_lead')}
            </Button>
          </Space>
        }
      >
        <Space
          style={{
            marginBottom: 16,
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 8,
          }}
        >
          <Input
            placeholder={translate('search')}
            allowClear
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            style={{ maxWidth: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            {translate('refresh')}
          </Button>
        </Space>

        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={leads}
          pagination={buildTablePagination(pagination)}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      <Drawer
        title={editingLead ? translate('edit') + ' ' + translate('lead') : translate('add_new_lead')}
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <LeadForm lead={editingLead} onSuccess={handleFormSuccess} onCancel={closeDrawer} />
      </Drawer>
    </>
  );
};

export default LeadList;
