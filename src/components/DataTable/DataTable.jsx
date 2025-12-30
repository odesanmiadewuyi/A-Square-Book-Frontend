import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';

const AUTO_PRINT_DELAY_MS = 1000;
const AUTO_PRINT_POLL_MS = 200;

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}
export default function DataTable({ config, extra = [] }) {
  let {
    entity,
    dataTableColumns,
    DATATABLE_TITLE,
    fields,
    searchConfig,
    defaultListOptions = {},
    disableCreate = false,
    disableEdit = false,
    disableDelete = false,
    menuExtra = [],
    headerExtras,
    onMenuAction,
    onRowRead,
    openOnRowClick = false,
    selectionActions = [],
    selectionType = 'checkbox',
  } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const location = useLocation();
  const navigate = useNavigate();
  const autoPrint = useMemo(
    () => new URLSearchParams(location.search).get('print') === '1',
    [location.search]
  );
  const printedRef = useRef(false);
  const hasSeenLoadingRef = useRef(false);
  const tableWrapperRef = useRef(null);

  const hasSelectionActions = Array.isArray(selectionActions) && selectionActions.length > 0;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (!autoPrint) {
      printedRef.current = false;
    }
  }, [autoPrint]);

  const buildMenuItems = (record) => {
    const items = [];

    items.push({
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    });

    if (!disableEdit) {
      items.push({
        label: translate('Edit'),
        key: 'edit',
        icon: <EditOutlined />,
      });
    }

    if (Array.isArray(menuExtra) && menuExtra.length > 0) {
      menuExtra.forEach((item) => {
        if (item) {
          const disabled =
            typeof item.disabled === 'function'
              ? item.disabled(record)
              : item.disabled ?? false;
          items.push({ ...item, disabled });
        }
      });
    }

    if (!disableDelete) {
      if (items.length > 0) {
        items.push({
          type: 'divider',
        });
      }

      items.push({
        label: translate('Delete'),
        key: 'delete',
        icon: <DeleteOutlined />,
      });
    }

    if (Array.isArray(extra) && extra.length > 0) {
      items.push(...extra);
    }

    return items;
  };

  const handleRead = (record) => {
    if (typeof onRowRead === 'function') {
      try {
        onRowRead(record);
        return;
      } catch (e) {
        // fall back to default panel behavior
      }
    }
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: buildMenuItems(record),
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;

                case 'delete':
                  handleDelete(record);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;

                default:
                  if (typeof onMenuAction === 'function') {
                    onMenuAction(key, record);
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
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          />
        </Dropdown>
      ),
    },
  ];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  useEffect(() => {
    if (listIsLoading) {
      hasSeenLoadingRef.current = true;
    }
  }, [listIsLoading]);

  const { pagination, items: dataSource } = listResult;

  const dispatch = useDispatch();

  const clearPrintParam = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('print')) return;
    params.delete('print');
    const search = params.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { ...defaultListOptions, page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, [entity, defaultListOptions]);

  const filterTable = (e) => {
    const value = e.target.value;
    const options = { ...defaultListOptions, q: value, fields: searchConfig?.searchFields || '' };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity, options: { ...defaultListOptions } }));
  };

  const isTableReady = useCallback(() => {
    const root = tableWrapperRef.current;
    if (!root) return false;
    if (root.querySelector('.ant-spin')) return false;
    const body = root.querySelector('.ant-table-tbody');
    if (!body) return false;
    const rows = body.querySelectorAll('tr');
    if (Array.isArray(dataSource) && dataSource.length > 0) {
      if (rows.length < dataSource.length) return false;
    } else if (!root.querySelector('.ant-empty, .ant-table-placeholder')) {
      return false;
    }
    const rect = root.getBoundingClientRect();
    if (!rect || rect.height === 0 || rect.width === 0) return false;
    return true;
  }, [dataSource]);

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, [dataSource]);

  useEffect(() => {
    if (!autoPrint || listIsLoading || printedRef.current || !hasSeenLoadingRef.current) return;
    let raf1;
    let raf2;
    let delayTimer;
    let pollTimer;
    let printTimer;
    const triggerPrint = () => {
      if (typeof window === 'undefined') {
        clearPrintParam();
        return;
      }
      try {
        window.print();
      } catch (_) {}
      clearPrintParam();
    };
    const schedulePrint = () => {
      if (typeof window === 'undefined') {
        clearPrintParam();
        return;
      }
      if (typeof window.requestAnimationFrame !== 'function') {
        printTimer = setTimeout(triggerPrint, AUTO_PRINT_DELAY_MS);
        return;
      }
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          printTimer = setTimeout(triggerPrint, AUTO_PRINT_DELAY_MS);
        });
      });
    };
    const checkReady = () => {
      if (isTableReady()) {
        printedRef.current = true;
        schedulePrint();
        return;
      }
      pollTimer = setTimeout(checkReady, AUTO_PRINT_POLL_MS);
    };
    delayTimer = setTimeout(checkReady, AUTO_PRINT_DELAY_MS);
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (pollTimer) clearTimeout(pollTimer);
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
      if (printTimer) clearTimeout(printTimer);
    };
  }, [autoPrint, listIsLoading, clearPrintParam, isTableReady]);

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={(() => {
          const buttons = [
            <Input
              key={`searchFilterDataTable}`}
              onChange={filterTable}
              placeholder={translate('search')}
              allowClear
            />,
            <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
              {translate('Refresh')}
            </Button>,
          ];
          if (!disableCreate) {
            buttons.push(<AddNewItem key={`${uniqueId()}`} config={config} />);
          }
          if (hasSelectionActions) {
            selectionActions.forEach((action) => {
              if (!action) return;
              const { key, label, icon, onAction, loading, disabled } = action;
              const isDisabled =
                selectedRowKeys.length === 0 ||
                (typeof disabled === 'function' ? disabled(selectedRows) : disabled);
              buttons.push(
                <Button
                  key={`selection-action-${key}`}
                  type="primary"
                  icon={icon}
                  loading={!!loading}
                  disabled={isDisabled}
                  onClick={() => {
                    if (typeof onAction === 'function') {
                      onAction(selectedRows);
                    }
                  }}
                >
                  {label}
                </Button>
              );
            });
          }
          const extraHeaderItems =
            typeof headerExtras === 'function' ? (headerExtras() || []) : headerExtras || [];
          if (Array.isArray(extraHeaderItems) && extraHeaderItems.length > 0) {
            buttons.push(...extraHeaderItems);
          }
          return buttons;
        })()}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <div ref={tableWrapperRef}>
        <Table
          columns={dataTableColumns}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
          scroll={{ x: true }}
          onRow={(record) => ({
            onClick: () => {
              if (openOnRowClick === true || openOnRowClick === 'read') {
                handleRead(record);
              } else if (openOnRowClick === 'edit') {
                handleEdit(record);
              }
            },
          })}
          rowSelection={
            hasSelectionActions
              ? {
                  type: selectionType === 'radio' ? 'radio' : 'checkbox',
                  selectedRowKeys,
                  onChange: (keys, rows) => {
                    setSelectedRowKeys(keys);
                    setSelectedRows(rows);
                  },
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
