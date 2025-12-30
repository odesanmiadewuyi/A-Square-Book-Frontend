import { useEffect } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  RedoOutlined,
  PlusOutlined,
  EllipsisOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { generate as uniqueId } from 'shortid';
import { useNavigate } from 'react-router-dom';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

function AddNewItem({ config }) {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity, addNewPath } = config;

  const handleClick = () => {
    const target = addNewPath || `/${entity.toLowerCase()}/create`;
    navigate(target);
  };

  return (
    <Button onClick={handleClick} type="primary" icon={<PlusOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  );
}

export default function DataTable({ config, extra = [] }) {
  const translate = useLanguage();
  let { entity, dataTableColumns, disableAdd = false, searchConfig, defaultListOptions = {}, disableRead = false, disableEdit = false, disableDelete = false, disableDownload = false, headerExtras, readDenied, onRowClick } = config;

  if (readDenied) {
    return (
      <PageHeader
        title={config.DATATABLE_TITLE || translate('No access')}
        ghost={true}
        style={{ padding: '20px 0px' }}
        extra={[]}
      />
    );
  }

  const { DATATABLE_TITLE } = config;

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;

  const extraItemsFromConfig = Array.isArray(config.extraMenuItems) ? config.extraMenuItems : [];
  const items = [
    ...(!disableRead ? [{ label: translate('Show'), key: 'read', icon: <EyeOutlined /> }] : []),
    ...(!disableEdit ? [{ label: translate('Edit'), key: 'edit', icon: <EditOutlined /> }] : []),
    ...(!disableDownload ? [{ label: translate('Download'), key: 'download', icon: <FilePdfOutlined /> }] : []),
    ...extra,
    ...extraItemsFromConfig,
    ...(!disableDelete ? [{ type: 'divider' }, { label: translate('Delete'), key: 'delete', icon: <DeleteOutlined /> }] : []),
  ];

  const navigate = useNavigate();

  const pathPrefix = (config && config.pathPrefix) ? config.pathPrefix : entity;

  const handleRead = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${pathPrefix}/read/${record._id}`);
  };
  const handleEdit = (record) => {
    const data = { ...record };
    dispatch(erp.currentAction({ actionType: 'update', data }));
    navigate(`/${pathPrefix}/update/${record._id}`);
  };
  const handleDownload = (record) => {
    window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
  };

  const handleDelete = (record) => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  const handleRecordPayment = (record) => {
    dispatch(erp.currentItem({ data: record }));
    const templated = config?.recordPaymentPath || `/invoice/pay/:id`;
    const path = templated.replace(':id', record._id);
    navigate(path);
  };

  const baseCols = Array.isArray(dataTableColumns) ? dataTableColumns : [];
  dataTableColumns = [
    ...baseCols,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;
                case 'download':
                  handleDownload(record);
                  break;
                case 'delete':
                  handleDelete(record);
                  break;
                case 'recordPayment':
                  handleRecordPayment(record);
                  break;
                default:
                  if (typeof config.onRowAction === 'function') {
                    config.onRowAction(key, record);
                  }
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        </Dropdown>
      ),
    },
  ];

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination) => {
    const options = { ...defaultListOptions, page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(erp.list({ entity, options }));
  };

  const dispatcher = () => {
    const options = { ...defaultListOptions };
    dispatch(erp.list({ entity, options }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  const filterTable = (value) => {
    const options = { ...defaultListOptions, equal: value, filter: searchConfig?.entity };
    dispatch(erp.list({ entity, options }));
  };

  return (
    <>
      <PageHeader
        title={DATATABLE_TITLE}
        ghost={true}
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        extra={[
          searchConfig?.entity && (
            <AutoCompleteAsync
              key={`${uniqueId()}`}
              entity={searchConfig?.entity}
              displayLabels={['name']}
              searchFields={'name'}
              onChange={filterTable}
            />
          ),
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,

          !disableAdd && <AddNewItem config={config} key={`${uniqueId()}`} />,
          ...(typeof headerExtras === 'function' ? (headerExtras() || []) : (headerExtras || [])),
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
        onRow={
          typeof onRowClick === 'function'
            ? (record) => ({
                onClick: (event) => {
                  if (event?.defaultPrevented) return;
                  onRowClick(record, event);
                },
                style: { cursor: 'pointer' },
              })
            : undefined
        }
      />
    </>
  );
}
