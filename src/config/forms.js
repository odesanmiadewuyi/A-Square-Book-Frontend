export const MODULE_LABELS = {
  gl: 'General Ledger',
  ap: 'Accounts Payable',
  ar: 'Accounts Receivable',
  bank: 'Banks',
  sales: 'Sales / Orders',
  products: 'Products',
  expenses: 'Expenses',
  crm: 'CRM',
  budget: 'Budget',
  settings: 'Settings',
};

export const FORMS_CATALOG = {
  gl_account_create: { module: 'gl', label: 'GL Account - Create' },
  gl_account_update: { module: 'gl', label: 'GL Account - Update' },
  gl_journal_create: { module: 'gl', label: 'GL Journal - Create' },
  gl_journal_update: { module: 'gl', label: 'GL Journal - Update' },
  gl_period_manage: { module: 'gl', label: 'GL Periods - Manage' },
  gl_account_class_manage: { module: 'gl', label: 'GL Account Class - Manage' },
  gl_account_group_manage: { module: 'gl', label: 'GL Account Group - Manage' },
  gl_account_subgroup_manage: { module: 'gl', label: 'GL Account Sub-Group - Manage' },

  ap_bill_create: { module: 'ap', label: 'AP Bill - Create' },
  ap_payment_create: { module: 'ap', label: 'AP Payment - Create' },
  ap_joborder_manage: { module: 'ap', label: 'AP Job Order - Manage' },
  ap_requisition_manage: { module: 'ap', label: 'AP Requisition - Manage' },

  ar_receipt_create: { module: 'ar', label: 'AR Receipt - Create' },

  order_create: { module: 'sales', label: 'Order - Create' },
  quote_create: { module: 'sales', label: 'Quote - Create' },
  invoice_manage: { module: 'sales', label: 'Invoice - Manage' },
  payment_manage: { module: 'sales', label: 'Payment - Manage' },

  bank_create: { module: 'bank', label: 'Bank - Create' },
  bank_transfer: { module: 'bank', label: 'Bank Transfer - Create' },
  bank_reconcile: { module: 'bank', label: 'Bank Reconcile - Manage' },
  bank_transaction: { module: 'bank', label: 'Bank Transaction - Manage' },

  expense_create: { module: 'expenses', label: 'Expense - Create' },
  expense_category_manage: { module: 'expenses', label: 'Expense Category - Manage' },
  expense_invoice_manage: { module: 'expenses', label: 'Expense Invoice - Manage' },
  expense_invoice_detail_manage: { module: 'expenses', label: 'Expense Invoice Detail - Manage' },

  product_create: { module: 'products', label: 'Product - Create' },
  product_category_manage: { module: 'products', label: 'Product Category - Manage' },

  crm_person_create: { module: 'crm', label: 'Person / Customer - Create' },
  crm_lead_create: { module: 'crm', label: 'Lead - Create' },
  crm_company_manage: { module: 'crm', label: 'Company - Manage' },
  crm_client_manage: { module: 'crm', label: 'Client - Manage' },
  crm_leadoffer_manage: { module: 'crm', label: 'Lead Offer - Manage' },

  settings_update: { module: 'settings', label: 'Settings - Update' },
  department_manage: { module: 'settings', label: 'Department - Manage' },
};

export const FORM_OPTIONS = Object.entries(MODULE_LABELS)
  .map(([module, moduleLabel]) => {
    const options = Object.entries(FORMS_CATALOG)
      .filter(([, meta]) => meta.module === module)
      .map(([value, meta]) => ({ label: meta.label, value }));
    if (!options.length) return null;
    return { label: moduleLabel, options };
  })
  .filter(Boolean);

export const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const DEFAULT_FORM_KEYS_BY_ENTITY = {
  postingaccount: { module: 'gl', create: 'gl_account_create', update: 'gl_account_update', delete: 'gl_account_update' },
  glaccount: { module: 'gl', create: 'gl_account_create', update: 'gl_account_update', delete: 'gl_account_update' },
  gljournal: { module: 'gl', create: 'gl_journal_create', update: 'gl_journal_update', delete: 'gl_journal_update' },
  glperiod: { module: 'gl', create: 'gl_period_manage', update: 'gl_period_manage', delete: 'gl_period_manage' },
  glaccountclass: { module: 'gl', create: 'gl_account_class_manage', update: 'gl_account_class_manage', delete: 'gl_account_class_manage' },
  glaccountgroup: { module: 'gl', create: 'gl_account_group_manage', update: 'gl_account_group_manage', delete: 'gl_account_group_manage' },
  glaccountsubgroup: { module: 'gl', create: 'gl_account_subgroup_manage', update: 'gl_account_subgroup_manage', delete: 'gl_account_subgroup_manage' },

  order: { module: 'sales', create: 'order_create', update: 'order_create', delete: 'order_create' },
  quote: { module: 'sales', create: 'quote_create', update: 'quote_create', delete: 'quote_create' },
  invoice: { module: 'sales', create: 'invoice_manage', update: 'invoice_manage', delete: 'invoice_manage' },
  payment: { module: 'sales', create: 'payment_manage', update: 'payment_manage', delete: 'payment_manage' },

  product: { module: 'products', create: 'product_create', update: 'product_create', delete: 'product_create' },
  productcategory: { module: 'products', create: 'product_category_manage', update: 'product_category_manage', delete: 'product_category_manage' },

  expense: { module: 'expenses', create: 'expense_create', update: 'expense_create', delete: 'expense_create' },
  expensecategory: { module: 'expenses', create: 'expense_category_manage', update: 'expense_category_manage', delete: 'expense_category_manage' },
  invoicedetail: { module: 'expenses', create: 'expense_invoice_detail_manage', update: 'expense_invoice_detail_manage', delete: 'expense_invoice_detail_manage' },

  bank: { module: 'bank', create: 'bank_create', update: 'bank_create', delete: 'bank_create' },
  banktransaction: { module: 'bank', create: 'bank_transaction', update: 'bank_transaction', delete: 'bank_transaction' },
  bankreconcile: { module: 'bank', create: 'bank_reconcile', update: 'bank_reconcile', delete: 'bank_reconcile' },

  person: { module: 'crm', create: 'crm_person_create', update: 'crm_person_create', delete: 'crm_person_create' },
  customer: { module: 'crm', create: 'crm_person_create', update: 'crm_person_create', delete: 'crm_person_create' },
  company: { module: 'crm', create: 'crm_person_create', update: 'crm_person_create', delete: 'crm_person_create' },
  lead: { module: 'crm', create: 'crm_lead_create', update: 'crm_lead_create', delete: 'crm_lead_create' },
  client: { module: 'crm', create: 'crm_client_manage', update: 'crm_client_manage', delete: 'crm_client_manage' },
  leadoffer: { module: 'crm', create: 'crm_leadoffer_manage', update: 'crm_leadoffer_manage', delete: 'crm_leadoffer_manage' },
  arreceipt: { module: 'ar', create: 'ar_receipt_create', update: 'ar_receipt_create', delete: 'ar_receipt_create' },

  setting: { module: 'settings', create: 'settings_update', update: 'settings_update', delete: 'settings_update' },
  admin: { module: 'settings', create: 'settings_update', update: 'settings_update', delete: 'settings_update' },
  department: { module: 'settings', create: 'department_manage', update: 'department_manage', delete: 'department_manage' },
};
