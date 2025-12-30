import { useLayoutEffect, useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem from '@/components/ReadItem';
import SearchItem from '@/components/SearchItem';
import DataTable from '@/components/DataTable/DataTable';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';

import { CrudLayout } from '@/layout';
import usePermissionConfig from '@/auth/usePermissionConfig';

function AutoOpenCreate({ enabled }) {
  const { crudContextAction } = useCrudContext();
  useEffect(() => {
    if (!enabled) return;
    try {
      const { panel, collapsedBox, readBox, editBox, advancedBox } = crudContextAction;
      readBox?.close?.();
      editBox?.close?.();
      advancedBox?.close?.();
      panel.open();
      collapsedBox.close();
    } catch (e) {
      // ignore
    }
  }, [enabled]);
  return null;
}
function SidePanelTopContent({ config, formElements, withUpload }) {
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  // Some pages (e.g. Budget Versions) don't provide deleteModalLabels.
  // Default to empty array to avoid runtime errors when mapping.
  const { deleteModalLabels = [] } = config;
  const { modal, editBox } = crudContextAction;
  const { disableEdit = false, disableDelete = false } = config;
  const onMenuAction = typeof config.onMenuAction === 'function' ? config.onMenuAction : null;
  // Allow pages to surface record-specific header actions. If `menuExtraHeader` is true, reuse menuExtra.
  // If it's an array, render that array instead.
  const rawHeaderActions = Array.isArray(config.menuExtraHeader)
    ? config.menuExtraHeader
    : config.menuExtraHeader
    ? (config.menuExtra || [])
    : [];

  const { isReadBoxOpen, isEditBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
  useEffect(() => {
    if (currentItem) {
      const currentlabels = Array.isArray(deleteModalLabels)
        ? deleteModalLabels
            .map((x) => (currentItem ? currentItem[x] : undefined))
            .filter((v) => v !== undefined && v !== null && v !== '')
            .join(' ')
        : '';

      setLabels(currentlabels);
    } else {
      setLabels('');
    }
  }, [currentItem, deleteModalLabels]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };
  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  // Hide the top action bar completely when neither read nor edit box is open
  // to avoid leaving empty vertical space above the add button in the drawer.
  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { display: 'none', opacity: 0 };
  return (
    <>
      <Row style={show} gutter={(24, 24)}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>{labels}</p>
        </Col>
        <Col span={14}>
          {rawHeaderActions && rawHeaderActions.length > 0 && currentItem && (
            <span style={{ float: 'right', marginTop: '8px' }}>
              {rawHeaderActions.map((item) => {
                if (!item) return null;
                const disabled =
                  typeof item.disabled === 'function'
                    ? item.disabled(currentItem)
                    : !!item.disabled;
                return (
                  <Button
                    key={`header-action-${item.key}`}
                    onClick={() => {
                      if (onMenuAction) onMenuAction(item.key, currentItem);
                    }}
                    type="default"
                    size="small"
                    disabled={disabled}
                    style={{ float: 'right', marginLeft: '5px' }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </span>
          )}
          {!disableDelete && (
            <Button
              onClick={removeItem}
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
            >
              {translate('remove')}
            </Button>
          )}
          {!disableEdit && (
            <Button
              onClick={editItem}
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
            >
              {translate('edit')}
            </Button>
          )}
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <ReadItem config={config} />
      {!disableEdit && (
        <UpdateForm config={config} formElements={formElements} withUpload={withUpload} />
      )}
    </>
  );
}

function FixHeaderPanel({ config }) {
  const { crudContextAction } = useCrudContext();
  const { disableCreate = false } = config;
  const { collapsedBox } = crudContextAction;

  const addNewItem = () => {
    collapsedBox.close();
  };

  return (
    <Row gutter={8}>
      <Col className="gutter-row" span={disableCreate ? 24 : 21}>
        <SearchItem config={config} />
      </Col>
      {!disableCreate && (
        <Col className="gutter-row" span={3}>
          <Button onClick={addNewItem} block={true} icon={<PlusOutlined />}></Button>
        </Col>
      )}
    </Row>
  );
}

function CrudModule({ config, createForm, updateForm, withUpload = false, autoOpenCreate = false }) {
  const dispatch = useDispatch();
  const { effectiveConfig } = usePermissionConfig(config);

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  const { disableCreate = false, disableDelete = false } = effectiveConfig;

  return (
    <CrudLayout
      config={effectiveConfig}
      fixHeaderPanel={<FixHeaderPanel config={effectiveConfig} />}
      sidePanelBottomContent={
        disableCreate ? null : (
          <CreateForm config={effectiveConfig} formElements={createForm} withUpload={withUpload} />
        )
      }
      sidePanelTopContent={
        <SidePanelTopContent config={effectiveConfig} formElements={updateForm} withUpload={withUpload} />
      }
    >
      <AutoOpenCreate enabled={autoOpenCreate} />
      <DataTable config={effectiveConfig} />
      {!disableDelete && <DeleteModal config={effectiveConfig} />}
    </CrudLayout>
  );
}

export default CrudModule;
