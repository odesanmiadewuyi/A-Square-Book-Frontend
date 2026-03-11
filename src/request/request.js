import axios from 'axios';
import { API_BASE_URL, BASE_URL } from '@/config/serverApiConfig';

import errorHandler from './errorHandler';
import successHandler from './successHandler';
import storePersist from '@/redux/storePersist';

const toApiBase = (raw = '') => {
  const cleaned = raw
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  if (!cleaned) return '';
  if (/\/api(?:\/|$)/i.test(cleaned)) return `${cleaned}/`;
  return `${cleaned}/api/`;
};

const toRootBase = (raw = '') => {
  const cleaned = raw
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  if (!cleaned) return '';
  return `${cleaned.replace(/\/api$/i, '')}/`;
};

const buildDirectApiBase = () => {
  // Respect explicit backend configuration first.
  const configured = toApiBase(import.meta.env.VITE_BACKEND_SERVER || '');
  if (configured) return configured;

  // If API_BASE_URL is absolute, use it for direct retries.
  if (/^https?:\/\//i.test((API_BASE_URL || '').toString().trim())) {
    const absolute = toApiBase(API_BASE_URL);
    if (absolute) return absolute;
  }

  // Last-resort defaults.
  if (typeof window !== 'undefined') {
    if (/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)) {
      return 'http://localhost:8888/api/';
    }
    return toApiBase(window.location.origin) || 'http://localhost:8888/api/';
  }
  return 'http://localhost:8888/api/';
};

const DIRECT_API_BASE = buildDirectApiBase();
const DIRECT_ROOT_BASE = toRootBase(DIRECT_API_BASE) || '/';
const SHOULD_TRY_DIRECT_ROOT = /(?:localhost|127\.0\.0\.1)/i.test(DIRECT_ROOT_BASE);
const normalizeEntity = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

const resolveCrudEntity = (value = '') => {
  const normalized = normalizeEntity(value);
  if (!normalized) return normalized;
  if (normalized === 'memberships') return 'membership';
  if (isMembershipCategoryPaymentEntity(normalized)) return 'membership/category-payment-setup';
  if (isMembershipCategoryEntity(normalized)) return 'membership/category-setup';
  if (isMembershipAccountSetupEntity(normalized)) return 'membership/account-setup';
  if (isMembershipCategoryTypeEntity(normalized)) return 'membership/category-type-setup';
  return normalized;
};

const withDirectApi = (path = '') => `${DIRECT_API_BASE}${path.toString().replace(/^\/+/, '')}`;
const withDirectRoot = (path = '') => `${DIRECT_ROOT_BASE}${path.toString().replace(/^\/+/, '')}`;

const MEMBERSHIP_BASES = ['membership', 'memberships'];
const MEMBERSHIP_ACCOUNT_SETUP_BASES = [
  'membership/account-setup',
  'membershipaccountsetup',
  'membership-account-setup',
  'membershipacountsetup',
  'membershipacccountsetup',
];
const MEMBERSHIP_CATEGORY_BASES = [
  'membership/category-setup',
  'membershipcategory',
  'membership-category-setup',
];
const MEMBERSHIP_CATEGORY_TYPE_BASES = [
  'membership/category-type-setup',
  'membershipcategorytype',
  'membership-category-type-setup',
  // Backward-compatibility aliases for typo variants seen in some builds.
  'membershippicategorytype',
  'membershippiategorytype',
  'membershippi/category-type-setup',
];
const MEMBERSHIP_CATEGORY_PAYMENT_BASES = [
  'membership/category-payment-setup',
  'membershipcategorypayment',
  'membership-category-payment-setup',
];

const isMembershipAccountSetupEntity = (value = '') => {
  const compact = value.toString().toLowerCase().replace(/[^a-z]/g, '');
  return compact.includes('membership') && compact.includes('accountsetup');
};
const isMembershipCategoryEntity = (value = '') => {
  const compact = value.toString().toLowerCase().replace(/[^a-z]/g, '');
  if (!compact.includes('membership') || !compact.includes('category')) return false;
  if (compact.includes('categorytype') || compact.includes('categorypayment')) return false;
  return (
    compact === 'membershipcategory' ||
    compact === 'membershipcategorysetup' ||
    compact.includes('categorysetup')
  );
};
const isMembershipCategoryTypeEntity = (value = '') => {
  const compact = value.toString().toLowerCase().replace(/[^a-z]/g, '');
  if (!compact.includes('membership')) return false;
  if (compact.includes('categorytype') || compact.includes('categorytypesetup')) return true;
  // Tolerate malformed entity keys such as membershippi...categorytype.
  if (compact.includes('picategorytype') || compact.includes('piategorytype')) return true;
  return false;
};
const isMembershipCategoryPaymentEntity = (value = '') => {
  const compact = value.toString().toLowerCase().replace(/[^a-z]/g, '');
  if (!compact.includes('membership')) return false;
  return compact.includes('categorypayment') || compact.includes('categorypaymentsetup');
};

const buildMembershipCandidates = (suffix = '') => {
  return buildMembershipEntityCandidates(MEMBERSHIP_BASES, suffix);
};
const buildMembershipAccountSetupCandidates = (suffix = '') => {
  return buildMembershipEntityCandidates(MEMBERSHIP_ACCOUNT_SETUP_BASES, suffix);
};
const buildMembershipCategoryCandidates = (suffix = '') => {
  return buildMembershipEntityCandidates(MEMBERSHIP_CATEGORY_BASES, suffix);
};
const buildMembershipCategoryTypeCandidates = (suffix = '') => {
  return buildMembershipEntityCandidates(MEMBERSHIP_CATEGORY_TYPE_BASES, suffix);
};
const buildMembershipCategoryPaymentCandidates = (suffix = '') => {
  return buildMembershipEntityCandidates(MEMBERSHIP_CATEGORY_PAYMENT_BASES, suffix);
};
const buildMembershipEntityCandidates = (bases = [], suffix = '') => {
  const cleanSuffix = suffix.toString().replace(/^\/+/, '');
  const urls = [];

  for (const base of bases) {
    const rel = `${base}/${cleanSuffix}`.replace(/\/+$/, '');
    urls.push(rel);
    urls.push(withDirectApi(rel));
    if (SHOULD_TRY_DIRECT_ROOT) {
      urls.push(withDirectRoot(rel));
    }
  }

  return Array.from(new Set(urls));
};

const isFileLike = (value) => {
  if (!value || typeof value !== 'object') return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  return false;
};

const appendFormValue = (formData, key, value) => {
  if (value === undefined || value === null) return;
  if (isFileLike(value)) {
    formData.append(key, value);
    return;
  }
  if (value instanceof Date || (typeof value === 'object' && typeof value.toISOString === 'function')) {
    formData.append(key, value.toISOString());
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormValue(formData, `${key}[${index}]`, item));
    return;
  }
  if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
    return;
  }
  formData.append(key, String(value));
};

const toMultipartPayload = (jsonData = {}) => {
  if (typeof FormData !== 'undefined' && jsonData instanceof FormData) return jsonData;
  const formData = new FormData();
  Object.keys(jsonData || {}).forEach((key) => {
    appendFormValue(formData, key, jsonData[key]);
  });
  return formData;
};

function findKeyByPrefix(object, prefix) {
  for (var property in object) {
    if (object.hasOwnProperty(property) && property.toString().startsWith(prefix)) {
      return property;
    }
  }
}

function includeToken() {
  // Normalize base URL and ensure trailing slash, so relative paths resolve correctly.
  const ensureTrailingSlash = (s = '') => (s.endsWith('/') ? s : s + '/');
  const stripTrailingSlash = (s = '') => s.replace(/\/+$/, '');

  const base = (API_BASE_URL || '').toString().trim();
  const baseOrigin =
    BASE_URL && BASE_URL !== '/'
      ? stripTrailingSlash(BASE_URL)
      : typeof window !== 'undefined'
      ? window.location.origin
      : '';

  let resolved;
  if (/^https?:\/\//i.test(base)) {
    // Guard against misconfigured env values like https://host (without /api).
    const normalizedAbsolute = toApiBase(base) || base;
    resolved = ensureTrailingSlash(stripTrailingSlash(normalizedAbsolute));
  } else {
    const normalizedRelative = toApiBase(base) || '/api/';
    const path = normalizedRelative.startsWith('/') ? normalizedRelative : '/' + normalizedRelative;
    resolved = ensureTrailingSlash(stripTrailingSlash(baseOrigin) + stripTrailingSlash(path));
  }

  axios.defaults.baseURL = resolved; // e.g., http://localhost:3002/api/
  axios.defaults.withCredentials = true;

  const auth = storePersist.get('auth');
  if (auth) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
  }
}

const request = {
  create: async ({ entity, jsonData }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const response = await axios.post(targetEntity + '/create', jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = normalizeEntity(resolveCrudEntity(entity));
      if (status === 404 && isMembershipAccountSetupEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipAccountSetupCandidates('create');
          for (const url of candidates) {
            try {
              const response = await axios.post(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryPaymentEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryPaymentCandidates('create');
          for (const url of candidates) {
            try {
              const response = await axios.post(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryTypeEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryTypeCandidates('create');
          for (const url of candidates) {
            try {
              const response = await axios.post(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryCandidates('create');
          for (const url of candidates) {
            try {
              const response = await axios.post(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      return errorHandler(error);
    }
  },
  createAndUpload: async ({ entity, jsonData }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const payload = toMultipartPayload(jsonData);
      const response = await axios.post(targetEntity + '/create', payload);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  read: async ({ entity, id }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const response = await axios.get(targetEntity + '/read/' + id);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = normalizeEntity(resolveCrudEntity(entity));
      if (status === 404 && isMembershipAccountSetupEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipAccountSetupCandidates(`read/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryPaymentEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryPaymentCandidates(`read/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryTypeEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryTypeCandidates(`read/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryCandidates(`read/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      return errorHandler(error);
    }
  },
  update: async ({ entity, id, jsonData }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const response = await axios.patch(targetEntity + '/update/' + id, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = normalizeEntity(resolveCrudEntity(entity));
      if (status === 404 && isMembershipAccountSetupEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipAccountSetupCandidates(`update/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.patch(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryPaymentEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryPaymentCandidates(`update/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.patch(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryTypeEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryTypeCandidates(`update/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.patch(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryCandidates(`update/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.patch(url, jsonData);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      return errorHandler(error);
    }
  },
  updateAndUpload: async ({ entity, id, jsonData }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const payload = toMultipartPayload(jsonData);
      const response = await axios.patch(targetEntity + '/update/' + id, payload);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  delete: async ({ entity, id }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      const response = await axios.delete(targetEntity + '/delete/' + id);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = normalizeEntity(resolveCrudEntity(entity));
      if (status === 404 && isMembershipAccountSetupEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipAccountSetupCandidates(`delete/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.delete(url);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryPaymentEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryPaymentCandidates(`delete/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.delete(url);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryTypeEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryTypeCandidates(`delete/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.delete(url);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      if (status === 404 && isMembershipCategoryEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryCandidates(`delete/${id}`);
          for (const url of candidates) {
            try {
              const response = await axios.delete(url);
              successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global handler.
        }
      }
      return errorHandler(error);
    }
  },

  filter: async ({ entity, options = {} }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      let filter = options.filter ? 'filter=' + options.filter : '';
      let equal = options.equal ? '&equal=' + options.equal : '';
      let query = `?${filter}${equal}`;

      const response = await axios.get(targetEntity + '/filter' + query);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  search: async ({ entity, options = {} }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      // headersInstance.cancelToken = source.token;
      const response = await axios.get(targetEntity + '/search' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  list: async ({ entity, options = {} }) => {
    const targetEntity = resolveCrudEntity(entity);
    let query = '?';
    for (var key in options) {
      query += key + '=' + options[key] + '&';
    }
    query = query.slice(0, -1);

    try {
      includeToken();
      const response = await axios.get(targetEntity + '/list' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = normalizeEntity(targetEntity);
      if (status === 404 && normalizedEntity === 'membership') {
        try {
          includeToken();
          const candidates = buildMembershipCandidates(`list${query}`);

          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: false,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to original error handling.
        }
        return {
          success: true,
          result: [],
          pagination: { page: 1, count: 0 },
          message: 'Membership endpoint unavailable in current API target',
        };
      }
      if (status === 404 && isMembershipAccountSetupEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipAccountSetupCandidates(`list${query}`);

          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: false,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to original error handling.
        }
        return {
          success: true,
          result: [],
          pagination: { page: 1, count: 0 },
          message: 'Membership account setup endpoint unavailable in current API target',
        };
      }
      if (status === 404 && isMembershipCategoryPaymentEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryPaymentCandidates(`list${query}`);

          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: false,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to original error handling.
        }
        return {
          success: true,
          result: [],
          pagination: { page: 1, count: 0 },
          message: 'Membership category payment endpoint unavailable in current API target',
        };
      }
      if (status === 404 && isMembershipCategoryTypeEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryTypeCandidates(`list${query}`);

          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: false,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to original error handling.
        }
        return {
          success: true,
          result: [],
          pagination: { page: 1, count: 0 },
          message: 'Membership category type endpoint unavailable in current API target',
        };
      }
      if (status === 404 && isMembershipCategoryEntity(normalizedEntity)) {
        try {
          includeToken();
          const candidates = buildMembershipCategoryCandidates(`list${query}`);

          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              successHandler(response, {
                notifyOnSuccess: false,
                notifyOnFailed: false,
              });
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to original error handling.
        }
        return {
          success: true,
          result: [],
          pagination: { page: 1, count: 0 },
          message: 'Membership category endpoint unavailable in current API target',
        };
      }
      return errorHandler(error);
    }
  },
  listAll: async ({ entity, options = {} }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);

      const response = await axios.get(targetEntity + '/listAll' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  post: async ({ entity, jsonData }) => {
    try {
      includeToken();
      const response = await axios.post(entity, jsonData);

      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  get: async ({ entity }) => {
    try {
      includeToken();
      const response = await axios.get(entity);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const normalizedEntity = (entity || '').toString().toLowerCase().replace(/^\/+/, '');

      // Local-dev fallback: some proxy/API targets may not expose this custom route yet.
      if (status === 404 && normalizedEntity === 'membershippayment/next-ref') {
        try {
          includeToken();
          const candidates = Array.from(
            new Set([
              'membershippayment/next-ref',
              'membership/membership-payment/next-ref',
              withDirectApi('membershippayment/next-ref'),
              withDirectApi('membership/membership-payment/next-ref'),
              withDirectRoot('membershippayment/next-ref'),
              withDirectRoot('membership/membership-payment/next-ref'),
            ])
          );
          for (const url of candidates) {
            try {
              const response = await axios.get(url);
              return response.data;
            } catch (retryError) {
              if (retryError?.response?.status !== 404) {
                throw retryError;
              }
            }
          }
        } catch (_) {
          // Fall through to global error handling below.
        }
      }
      return errorHandler(error);
    }
  },
  patch: async ({ entity, jsonData }) => {
    try {
      includeToken();
      const response = await axios.patch(entity, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  upload: async ({ entity, id, jsonData }) => {
    try {
      includeToken();
      const response = await axios.patch(entity + '/upload/' + id, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  source: () => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return source;
  },

  summary: async ({ entity, options = {} }) => {
    try {
      includeToken();
      const targetEntity = resolveCrudEntity(entity);
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      const response = await axios.get(targetEntity + '/summary' + query);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });

      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  mail: async ({ entity, jsonData }) => {
    try {
      includeToken();
      const response = await axios.post(entity + '/mail/', jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  convert: async ({ entity, id }) => {
    try {
      includeToken();
      const response = await axios.get(`${entity}/convert/${id}`);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
};
export default request;
