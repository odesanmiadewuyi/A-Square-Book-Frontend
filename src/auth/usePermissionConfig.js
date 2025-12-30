import useCanForm from './useCanForm';
import { DEFAULT_FORM_KEYS_BY_ENTITY } from '@/config/forms';

const resolvePermissionMeta = (config = {}) => {
  const entityKeyRaw = (config.entity || '').toString().toLowerCase();
  const normalizedKey = entityKeyRaw.replace(/[^\w]/g, '');
  const fallback =
    DEFAULT_FORM_KEYS_BY_ENTITY[entityKeyRaw] ||
    DEFAULT_FORM_KEYS_BY_ENTITY[normalizedKey] ||
    {};
  const formKeys = { ...fallback, ...(config.formKeys || {}) };
  const moduleKey = config.moduleKey || fallback.module || null;
  return { formKeys, moduleKey };
};

export default function usePermissionConfig(config = {}) {
  const { formKeys, moduleKey } = resolvePermissionMeta(config);
  const canForm = useCanForm(moduleKey);

  const canRead = canForm(null, moduleKey);
  const canCreate = canForm(formKeys.create, moduleKey);
  const canUpdate = canForm(formKeys.update || formKeys.edit, moduleKey);
  const canDelete = canForm(formKeys.delete || formKeys.update || formKeys.create, moduleKey);

  const effectiveConfig = {
    ...config,
    moduleKey,
    formKeys,
    readDenied: config.readDenied || !canRead,
    disableCreate: config.disableCreate || !canCreate,
    disableAdd: config.disableAdd || config.disableCreate || !canCreate,
    disableEdit: config.disableEdit || !canUpdate,
    disableDelete: config.disableDelete || !canDelete,
  };

  return { effectiveConfig, formKeys, moduleKey, canForm };
}

export { resolvePermissionMeta };
