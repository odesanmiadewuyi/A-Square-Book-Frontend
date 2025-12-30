import request from './request';

// Create a GeneralLedger entry
// Fields: number?, date, period?, source, description, status, currency, postingcode, Debit, Credit
export async function createGeneralLedgerEntry(data) {
  const payload = { ...data };
  if (payload.Debit == null && payload.debit != null) payload.Debit = Number(payload.debit) || 0;
  if (payload.Credit == null && payload.credit != null) payload.Credit = Number(payload.credit) || 0;
  if (typeof payload.Debit === 'string') payload.Debit = Number(payload.Debit) || 0;
  if (typeof payload.Credit === 'string') payload.Credit = Number(payload.Credit) || 0;
  if (payload.currency) payload.currency = String(payload.currency).toUpperCase();
  if (payload.source) payload.source = String(payload.source);
  if (!payload.date) payload.date = new Date().toISOString();
  if (payload.accountno != null) payload.accountno = String(payload.accountno);
  return request.create({ entity: 'generalledger', jsonData: payload });
}
