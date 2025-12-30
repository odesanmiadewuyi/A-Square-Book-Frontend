export const normalizeRoleValue = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const isOwnerRole = (role) => {
  const normalized = normalizeRoleValue(role);
  return normalized === 'owner' || normalized === 'accountowner';
};

export const isPrivilegedRole = (role) => {
  const normalized = normalizeRoleValue(role);
  return normalized === 'admin' || normalized === 'superadmin' || isOwnerRole(role);
};
