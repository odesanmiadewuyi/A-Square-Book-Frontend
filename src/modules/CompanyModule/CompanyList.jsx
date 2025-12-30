import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Input, message, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { companyService } from '@/request/companyService';

import CompanyForm from './CompanyForm';

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

const CompanyList = () => {
  const translate = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const navigate = useNavigate();

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await companyService.getCompanies({
        page: params.page,
        limit: params.limit,
        search: params.search,
      });

      if (response?.success) {
        setCompanies(response.data || []);
        const serverPagination = response.pagination || {};
        setPagination({
          current: serverPagination.currentPage || params.page,
          pageSize: params.limit,
          total: serverPagination.totalRecords || 0,
        });
      } else {
        message.error(response?.message || 'Unable to fetch companies');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || 'Unable to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((current) => ({ ...current, page: 1, search: searchValue.trim() }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const openCreateDrawer = useCallback(() => {
    setEditingCompany(null);
    setDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((company) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingCompany(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeDrawer();
    fetchCompanies();
  }, [closeDrawer, fetchCompanies]);

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
    async (companyId) => {
      setDeletingId(companyId);
      try {
        const response = await companyService.deleteCompany(companyId);
        if (response?.success) {
          message.success(response.message || 'Company deleted successfully');
          fetchCompanies();
        } else {
          message.error(response?.message || 'Unable to delete company');
        }
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        message.error(apiMessage || 'Unable to delete company');
      } finally {
        setDeletingId(null);
      }
    },
    [fetchCompanies]
  );

  const handleRefresh = useCallback(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const columns = useMemo(
    () => [
      {
        title: translate('name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: translate('contact'),
        dataIndex: 'contact',
        key: 'contact',
        render: (value) => {
          if (!value) {
            return '-';
          }
          const names = [value.firstname, value.lastname].filter(Boolean).join(' ');
          return names || value.email || '-';
        },
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
        render: (value) => value || '-',
      },
      {
        title: translate('email'),
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: translate('website'),
        dataIndex: 'website',
        key: 'website',
        render: (value) =>
          value ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            '-'
          ),
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
              title={translate('delete_confirmation') || 'Delete this company?'}
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
        title={translate('company_list')}
        extra={
          <Space>
            <Button onClick={() => navigate('/reports/companies/list?autoload=1')}>
              {translate('View Receipt') || 'View Receipt'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
              {translate('add_new_company')}
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
          dataSource={companies}
          pagination={buildTablePagination(pagination)}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      <Drawer
        title={editingCompany ? translate('edit') + ' ' + translate('company') : translate('add_new_company')}
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <CompanyForm company={editingCompany} onSuccess={handleFormSuccess} onCancel={closeDrawer} />
      </Drawer>
    </>
  );
};

export default CompanyList;

