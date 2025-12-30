import { Form, Input, Select } from 'antd';
import { UploadOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { message, Upload, Button, Switch } from 'antd';

import useLanguage from '@/locale/useLanguage';
import { MODULE_OPTIONS, FORM_OPTIONS } from '@/config/forms';

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

export default function AdminForm({ isUpdateForm = false, isForAdminOwner = false }) {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        label={translate('first Name')}
        name="name"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label={translate('last Name')}
        name="surname"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label={translate('email')}
        name="email"
        rules={[
          {
            required: true,
          },
          {
            type: 'email',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>

      {!isUpdateForm && (
        <Form.Item
          label={translate('Password')}
          name="password"
          rules={[
            {
              required: true,
            },
            {
              min: 8,
              message: translate('Password must be at least 8 characters long') || 'Password must be at least 8 characters long',
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      )}

      <Form.Item
        label={translate('Role')}
        name="role"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select>
          <Select.Option value="owner" disabled={!isForAdminOwner}>
            {translate('Account owner')}
          </Select.Option>
          <Select.Option value="admin" disabled={isForAdminOwner}>
            {translate('super_admin')}
          </Select.Option>
          <Select.Option value="manager" disabled={isForAdminOwner}>
            {translate('manager')}
          </Select.Option>
          <Select.Option value="employee" disabled={isForAdminOwner}>
            {translate('employee')}
          </Select.Option>
          <Select.Option value="create_only" disabled={isForAdminOwner}>
            {translate('create_only')}
          </Select.Option>
          <Select.Option value="read_only" disabled={isForAdminOwner}>
            {translate('read_only')}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('enabled')}
        name="enabled"
        valuePropName={'checked'}
        initialValue={true}
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>

      <Form.Item
        label={translate('Allowed Modules') || 'Allowed Modules'}
        name="allowedModules"
        tooltip="Select which modules this user can access. Leave empty to allow all modules."
      >
        <Select
          mode="multiple"
          allowClear
          placeholder={translate('Select modules') || 'Select modules'}
          options={MODULE_OPTIONS}
        />
      </Form.Item>

      <Form.Item
        label={translate('Allowed Forms') || 'Allowed Forms'}
        name="allowedForms"
        tooltip="Optionally pick specific forms inside the allowed modules. Leave empty to allow all forms inside the modules above."
      >
        <Select
          mode="multiple"
          allowClear
          placeholder={translate('Select forms') || 'Select forms'}
          options={FORM_OPTIONS}
          optionFilterProp="label"
          showSearch
        />
      </Form.Item>

      <Form.Item
        label={translate('Hidden Forms') || 'Hidden Forms'}
        name="blockedForms"
        tooltip="Pick forms to explicitly hide/deny even if the module is allowed."
      >
        <Select
          mode="multiple"
          allowClear
          placeholder={translate('Hide forms') || 'Hide forms'}
          options={FORM_OPTIONS}
          optionFilterProp="label"
          showSearch
        />
      </Form.Item>

      {/* <Form.Item
        name="file"
        label={translate('Photo')}
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload beforeUpload={beforeUpload}>
          <Button icon={<UploadOutlined />}>{translate('click_to_upload')}</Button>
        </Upload>
      </Form.Item> */}
    </>
  );
}
