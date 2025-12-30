import React from 'react';
import { Button } from 'antd';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import AutoForm from '@/components/AutoForm';
import { useNavigate } from 'react-router-dom';

export default function Department() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const entity = 'department';

  const searchConfig = {
    displayLabels: ['name', 'code'],
    searchFields: 'name,code',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name'];

  // Auto-generated columns and read view via `fields`
  const fields = {
    name: { type: 'string', label: 'Department Name', required: true },
    code: { type: 'string', label: 'Code', disabled: true, placeholder: translate('Auto-generated') || 'Auto-generated' },
    description: { type: 'textarea', label: 'Description' },
    enabled: { type: 'boolean', label: 'enabled' },
  };

  const Labels = {
    PANEL_TITLE: translate('Department') || 'Department',
    DATATABLE_TITLE: translate('Department List') || 'Department List',
    ADD_NEW_ENTITY: translate('Add New Department') || 'Add New Department',
    ENTITY_NAME: translate('Department') || 'Department',
  };

  const configPage = { entity, ...Labels };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
    headerExtras: () => [
      <Button key="department-print" onClick={() => navigate('/reports/department/list?autoload=1&print=1')}>
        {translate('Print List') || 'Print List'}
      </Button>,
    ],
  };

  return <CrudModule createForm={<AutoForm fields={fields} />} updateForm={<AutoForm fields={fields} />} config={config} />;
}
