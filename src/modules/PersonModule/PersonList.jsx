import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { personService } from '@/request/personService';

import PersonForm from './PersonForm';

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

const PersonList = () => {
  const translate = useLanguage();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const navigate = useNavigate();

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const response = await personService.getPeople({
        page: params.page,
        limit: params.limit,
        search: params.search,
      });

      if (response?.success) {
        setPeople(response.data || []);
        const serverPagination = response.pagination || {};
        setPagination({
          current: serverPagination.currentPage || params.page,
          pageSize: params.limit,
          total: serverPagination.totalRecords || 0,
        });
      } else {
        message.error(response?.message || 'Unable to fetch people');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || 'Unable to fetch people');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((current) => ({ ...current, page: 1, search: searchValue.trim() }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const openCreateDrawer = useCallback(() => {
    setEditingPerson(null);
    setDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((person) => {
    setEditingPerson(person);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingPerson(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    closeDrawer();
    fetchPeople();
  }, [closeDrawer, fetchPeople]);

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

  const handleDelete = useCallback(async (personId) => {
    setDeletingId(personId);
    try {
      const response = await personService.deletePerson(personId);
      if (response?.success) {
        message.success(response.message || 'Person deleted successfully');
        fetchPeople();
      } else {
        message.error(response?.message || 'Unable to delete person');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || 'Unable to delete person');
    } finally {
      setDeletingId(null);
    }
  }, [fetchPeople]);

  const handleRefresh = useCallback(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleViewReceipt = useCallback(() => {
    navigate('/reports/people/list?autoload=1');
  }, [navigate]);

  const columns = useMemo(
    () => [
      {
        title: translate('firstname'),
        dataIndex: 'firstname',
        key: 'firstname',
      },
      {
        title: translate('lastname'),
        dataIndex: 'lastname',
        key: 'lastname',
      },
      {
        title: translate('company'),
        dataIndex: 'company',
        key: 'company',
        render: (value) => value || '—',
      },
      {
        title: translate('country'),
        dataIndex: 'country',
        key: 'country',
        render: (value) => value || '—',
      },
      {
        title: translate('phone'),
        dataIndex: 'phone',
        key: 'phone',
        render: (value) => value || '—',
      },
      {
        title: translate('email'),
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: translate('status'),
        dataIndex: 'isActive',
        key: 'status',
        render: (value) => (
          <Tag color={value ? 'green' : 'red'}>
            {value ? translate('active') : translate('inactive')}
          </Tag>
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
              title={translate('delete_confirmation') || 'Delete this person?'}
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
    ], [deletingId, translate, openEditDrawer, handleDelete]);

  return (
    <>
      <Card
        title={translate('people_list')}
        extra={
          <Space>
            <Button onClick={handleViewReceipt}>
              {translate('View Receipt') || 'View Receipt'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
              {translate('add_new_person')}
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
          dataSource={people}
          pagination={buildTablePagination(pagination)}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      <Drawer
        title={editingPerson ? translate('edit') + ' ' + translate('person') : translate('add_new_person')}
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <PersonForm person={editingPerson} onSuccess={handleFormSuccess} onCancel={closeDrawer} />
      </Drawer>
    </>
  );
};

export default PersonList;












