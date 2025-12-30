// Map app entities to SSRS report paths and parameter names
export const REPORT_MAP = {
  invoice: { path: '/Reports/Invoices/Invoice', param: 'InvoiceId' },
  gljournal: { path: '/Reports/GL/Journal', param: 'JournalId' },
  payment: { path: '/Reports/Payments/Payment', param: 'PaymentId' },
  bill: { path: '/Reports/AP/Bill', param: 'BillId' },
};

export const getReportConfig = (entity) => {
  const key = (entity || '').toLowerCase();
  return REPORT_MAP[key] || null;
};
