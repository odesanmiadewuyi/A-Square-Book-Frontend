import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';

export default function AuditLogPage() {
  const translate = useLanguage();
  const entity = 'auditlog';

  const dataTableColumns = [
    { title: 'When', dataIndex: 'createdAt' },
    { title: 'User', dataIndex: 'userEmail' },
    { title: 'Action', dataIndex: 'action' },
    { title: 'Entity', dataIndex: 'entity' },
    { title: 'Entity Id', dataIndex: 'entityId' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Path', dataIndex: 'path' },
  ];

  const searchConfig = {
    displayLabels: ['userEmail', 'action', 'entity', 'path'],
    searchFields: 'userEmail,action,entity,path',
    outputValue: '_id',
  };

  const readColumns = [
    { title: 'When', dataIndex: 'createdAt' },
    { title: 'User', dataIndex: 'userEmail' },
    { title: 'Name', dataIndex: 'userName' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Action', dataIndex: 'action' },
    { title: 'Entity', dataIndex: 'entity' },
    { title: 'Entity Id', dataIndex: 'entityId' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Method', dataIndex: 'method' },
    { title: 'Path', dataIndex: 'path' },
    { title: 'IP', dataIndex: 'ip' },
    { title: 'User Agent', dataIndex: 'userAgent' },
    { title: 'Message', dataIndex: 'message' },
    { title: 'Payload', dataIndex: 'payload' },
  ];

  const config = {
    entity,
    moduleKey: 'settings',
    PANEL_TITLE: translate('Audit Log') || 'Audit Log',
    DATATABLE_TITLE: translate('Audit Log') || 'Audit Log',
    ADD_NEW_ENTITY: translate('Audit Log') || 'Audit Log',
    ENTITY_NAME: translate('Audit Log') || 'Audit Log',
    dataTableColumns,
    searchConfig,
    readColumns,
    deleteModalLabels: [],
    disableCreate: true,
    disableEdit: true,
    disableDelete: true,
  };

  return <CrudModule config={config} />;
}
