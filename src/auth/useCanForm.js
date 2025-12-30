import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { FORMS_CATALOG } from '@/config/forms';
import { isPrivilegedRole } from './roles';

export default function useCanForm(defaultModuleKey = null) {
  const admin = useSelector(selectCurrentAdmin);
  const allowedModules = Array.isArray(admin?.allowedModules) ? admin.allowedModules : [];
  const allowedForms = Array.isArray(admin?.allowedForms) ? admin.allowedForms : [];
  const blockedForms = Array.isArray(admin?.blockedForms) ? admin.blockedForms : [];
  const role = admin?.role;

  return useMemo(() => {
    const normalize = (value) =>
      (value || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const unwrapValue = (entry) => {
      if (!entry) return '';
      if (typeof entry === 'string' || typeof entry === 'number') return entry;
      if (typeof entry === 'object') {
        return entry.value || entry.label || entry.key || entry.name || '';
      }
      return '';
    };
    const canonicalModule = (value) => {
      const key = normalize(unwrapValue(value));
      if (!key) return '';
      const map = {
        generalledger: 'gl',
        general_ledger: 'gl',
        ledger: 'gl',
        accountspayable: 'ap',
        accountspayables: 'ap',
        accountsreceivable: 'ar',
        bank: 'bank',
        banks: 'bank',
        salesorders: 'sales',
        salesorder: 'sales',
        sales: 'sales',
        products: 'products',
        expenses: 'expenses',
        crm: 'crm',
        budget: 'budget',
        settings: 'settings',
        gl: 'gl',
        ap: 'ap',
        ar: 'ar',
      };
      return map[key] || key;
    };
    const normalizedAllowedForms = allowedForms.map((form) => unwrapValue(form)).filter(Boolean);
    const normalizedBlockedForms = blockedForms.map((form) => unwrapValue(form)).filter(Boolean);
    const modulesFromForms = normalizedAllowedForms
      .map((form) => FORMS_CATALOG[form]?.module)
      .filter(Boolean)
      .map((mod) => canonicalModule(mod))
      .filter(Boolean);
    const normalizedModules = [
      ...allowedModules.map((mod) => canonicalModule(mod)).filter(Boolean),
      ...modulesFromForms,
    ];

    return (formKey = null, moduleOverride = null) => {
      if (!admin) return false;
      if (isPrivilegedRole(role)) return true;

      const moduleKey =
        moduleOverride ||
        defaultModuleKey ||
        (formKey && FORMS_CATALOG[formKey]?.module) ||
        null;

      const canonicalKey = canonicalModule(moduleKey);
      const modulesEmpty = !normalizedModules || normalizedModules.length === 0;
      const hasModule =
        !canonicalKey ||
        modulesEmpty ||
        normalizedModules.includes(canonicalKey) ||
        normalizedModules.includes(normalize(moduleKey));
      if (!hasModule) return false;

       if (formKey && normalizedBlockedForms.includes(formKey)) return false;

      if (!formKey) return true;
      if (!normalizedAllowedForms || normalizedAllowedForms.length === 0) return true;
      return normalizedAllowedForms.includes(formKey);
    };
  }, [admin, role, allowedModules, allowedForms, blockedForms, defaultModuleKey]);
}
