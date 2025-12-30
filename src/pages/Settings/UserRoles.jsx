import React from 'react';
import { Tag } from 'antd';
import { useSelector } from 'react-redux';

import CrudModule from '@/modules/CrudModule/CrudModule';
import AdminForm from '@/forms/AdminForm';
import useLanguage from '@/locale/useLanguage';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { isOwnerRole } from '@/auth/roles';

const roleLabel = (role, translate) => {
  const labels = {
    owner: translate('account_owner') || 'Owner',
    admin: translate('admin_super_admin') || 'Admin',
    manager: translate('manager') || 'Manager',
    employee: translate('employee') || 'Employee',
    create_only: translate('create_only') || 'Create Only',
    read_only: translate('read_only') || 'Read Only',
  };
  return labels[role] || role || '-';
};

function AdminUpdateForm() {
  const { result: current } = useSelector(selectCurrentItem);
  const isOwner = isOwnerRole(current?.role);
  return <AdminForm isUpdateForm={true} isForAdminOwner={isOwner} />;
}

export default function UserRolesSettings() {
  const translate = useLanguage();
  const entity = 'admin';

  const dataTableColumns = [
    { title: translate('name') || 'Name', dataIndex: 'name' },
    { title: translate('email') || 'Email', dataIndex: 'email' },
    {
      title: translate('role') || 'Role',
      dataIndex: 'role',
      render: (value) => roleLabel(value, translate),
    },
    {
      title: translate('enabled') || 'Enabled',
      dataIndex: 'enabled',
      render: (val) => {
        const label = val ? translate('enabled') || 'Enabled' : translate('disabled') || 'Disabled';
        return <Tag color={val ? 'green' : 'red'}>{label}</Tag>;
      },
    },
  ];

  const searchConfig = {
    displayLabels: ['name', 'email', 'role'],
    searchFields: 'name,email,role',
    outputValue: '_id',
  };

  const Labels = {
    PANEL_TITLE: translate('admin') || 'Users & Roles',
    DATATABLE_TITLE: translate('admin_list') || 'User Access',
    ADD_NEW_ENTITY: translate('add_new_admin') || 'Add User',
    ENTITY_NAME: translate('admin') || 'User',
  };

  const readColumns = [
    { title: translate('name') || 'Name', dataIndex: 'name' },
    { title: translate('surname') || translate('last_name') || 'Surname', dataIndex: 'surname' },
    { title: translate('email') || 'Email', dataIndex: 'email' },
    { title: translate('role') || 'Role', dataIndex: 'role', render: (value) => roleLabel(value, translate) },
    { title: translate('enabled') || 'Enabled', dataIndex: 'enabled' },
  ];

  const config = {
    entity,
    ...Labels,
    dataTableColumns,
    searchConfig,
    readColumns,
    deleteModalLabels: ['name', 'email'],
  };

  return (
    <CrudModule
      config={config}
      createForm={<AdminForm />}
      updateForm={<AdminUpdateForm />}
      autoOpenCreate={false}
    />
  );
}
