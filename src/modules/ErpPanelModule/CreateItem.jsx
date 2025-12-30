import { useState, useEffect, useRef } from 'react';

import { Button, Tag, Form, Divider, message } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';

import useLanguage from '@/locale/useLanguage';

import { settingsAction } from '@/redux/settings/actions';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem, selectCurrentItem } from '@/redux/erp/selectors';

import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import { request } from '@/request';
import usePermissionConfig from '@/auth/usePermissionConfig';
import { getReportConfig } from '@/config/reports';

import Loading from '@/components/Loading';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

function SaveForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

export default function CreateItem({ config, CreateForm }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { effectiveConfig, formKeys, moduleKey, canForm } = usePermissionConfig(config);
  let {
    entity,
    redirectAfterCreate,
    redirectPathAfterCreate,
    pathPrefix,
    stayOnCreateAfterSave,
    hideViewReport,
  } = effectiveConfig;
  const safeEntity = entity || 'invoice';
  const [lastCreatedId, setLastCreatedId] = useState(() => {
    try {
      return localStorage.getItem(`lastCreated:${safeEntity}`) || null;
    } catch (_) {
      return null;
    }
  });
  const [lastVoucher, setLastVoucher] = useState(() => {
    try {
      return localStorage.getItem(`lastVoucher:${safeEntity}`) || '';
    } catch (_) {
      return '';
    }
  });
  const [lastNumber, setLastNumber] = useState(() => {
    try {
      return localStorage.getItem(`lastNumber:${safeEntity}`) || '';
    } catch (_) {
      return '';
    }
  });
  const [hasSavedThisSession, setHasSavedThisSession] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef(lastCreatedId);
  const lastVoucherRef = useRef(lastVoucher);
  const lastNumberRef = useRef(lastNumber);
  const lastRecordRef = useRef(null);
  const pendingViewRef = useRef(null);
  const localReportEntities = new Set([
    'gljournal',
    'arreceipt',
    'invoice',
    'bank',
    'product',
    'productcategory',
    'vendor',
    'banktransfer',
    'staff',
    'budgetversion',
    'budgetline',
    'budgetamendment',
    'budgettransfer',
    'department',
    'apcustomerinvoice',
    'joborder',
    'invoicejo',
  ]);

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);
  const basePath = `/${(pathPrefix || safeEntity.toLowerCase())}`;

  const canCreate = canForm(formKeys.create, moduleKey);
  useEffect(() => {
    if (!canCreate) {
      message.error(translate('Access denied for this action') || 'Access denied for this action');
      navigate('/');
    }
  }, [canCreate]);
  if (!canCreate) return null;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const { result: currentItem } = useSelector(selectCurrentItem);
  const storedIdKey = `lastCreated:${safeEntity}`;
  const getStoredId = () => {
    try {
      return localStorage.getItem(storedIdKey);
    } catch (_) {
      return null;
    }
  };
  const [storedIdState, setStoredIdState] = useState(() => getStoredId());
  const currentId =
    currentItem?._id ||
    currentItem?.id ||
    currentItem?.result?._id ||
    currentItem?.data?._id ||
    currentItem?.insertedId;
  const resolveLatestId = () => {
    return (
      lastSavedRef.current ||
      lastCreatedId ||
      result?._id ||
      result?.id ||
      result?.result?._id ||
      result?.data?._id ||
      result?.insertedId ||
      currentId ||
      storedIdState ||
      getStoredId() ||
      null
    );
  };

  const resolveLatestIdAsync = async () => {
    // 1) try immediate cached sources
    let latestId = resolveLatestId();
    if (latestId) return latestId;

    // 2) try stored full record
    try {
      const raw = sessionStorage.getItem(`lastRecord:${safeEntity}`);
      if (raw) {
        const rec = JSON.parse(raw);
        if (rec?._id) {
          latestId = rec._id;
          setLastCreatedId(latestId);
          lastSavedRef.current = latestId;
          if (rec.voucherNumber) {
            setLastVoucher(rec.voucherNumber);
            lastVoucherRef.current = rec.voucherNumber;
          }
          if (rec.number) {
            setLastNumber(rec.number.toString());
            lastNumberRef.current = rec.number.toString();
          }
          try { localStorage.setItem(storedIdKey, latestId); } catch (_) {}
        }
      }
    } catch (_) {}
    if (latestId) return latestId;

    // Helper: set/cache from record
    const cacheRecord = (rec) => {
      if (!rec?._id) return;
      latestId = rec._id;
      setLastCreatedId(rec._id);
      lastSavedRef.current = rec._id;
      try { localStorage.setItem(storedIdKey, rec._id); } catch (_) {}
      try { sessionStorage.setItem(`lastRecord:${safeEntity}`, JSON.stringify(rec)); } catch (_) {}
      if (rec.voucherNumber) {
        setLastVoucher(rec.voucherNumber);
        lastVoucherRef.current = rec.voucherNumber;
        try { localStorage.setItem(`lastVoucher:${safeEntity}`, rec.voucherNumber); } catch (_) {}
      }
      if (rec.number) {
        setLastNumber(rec.number.toString());
        lastNumberRef.current = rec.number.toString();
        try { localStorage.setItem(`lastNumber:${safeEntity}`, rec.number.toString()); } catch (_) {}
      }
    };

    // 3) fetch most recent
    try {
      const resp = await request.list({
        entity: safeEntity,
        options: { page: 1, items: 1, sortBy: 'createdAt', sortValue: -1 },
      });
      const first = Array.isArray(resp?.result) ? resp.result[0] : null;
      if (first?._id) {
        cacheRecord(first);
        return latestId;
      }
    } catch (_) {}

    // 4) search by voucher/number (stored or form)
    const formNumber = form.getFieldValue('number');
    const formVoucher = formNumber ? `Vou-${String(formNumber).padStart(6, '0')}` : null;
    const voucher = formVoucher || lastVoucherRef.current || lastVoucher;
    const numberVal = formNumber || lastNumberRef.current || lastNumber;

    if (!latestId && voucher) {
      try {
        const { result: byVoucher } = await request.filter({
          entity: safeEntity,
          options: { filter: 'voucherNumber', equal: voucher, items: 1 },
        });
        const first = Array.isArray(byVoucher) ? byVoucher[0] : null;
        if (first?._id) {
          cacheRecord(first);
          return latestId;
        }
      } catch (_) {}
    }

    if (!latestId && numberVal) {
      try {
        const { result: byNumber } = await request.filter({
          entity: safeEntity,
          options: { filter: 'number', equal: numberVal, items: 1 },
        });
        const firstNum = Array.isArray(byNumber) ? byNumber[0] : null;
        if (firstNum?._id) {
          cacheRecord(firstNum);
          return latestId;
        }
      } catch (_) {}
    }

    return latestId || null;
  };

  useEffect(() => {
    const s = getStoredId();
    if (s && !storedIdState) setStoredIdState(s);
  }, []);

  useEffect(() => {
    const candidateId =
      result?._id ||
      result?.id ||
      result?.result?._id ||
      result?.data?._id ||
      result?.insertedId ||
      currentId ||
      null;
    const candidateNumber =
      result?.number ||
      result?.result?.number ||
      '';
    const candidateVoucher =
      result?.voucherNumber ||
      result?.displayNumber ||
      (candidateNumber ? `Vou-${String(candidateNumber).padStart(6, '0')}` : '') ||
      result?.result?.voucherNumber ||
      result?.result?.displayNumber ||
      (result?.result?.number ? `Vou-${String(result.result.number).padStart(6, '0')}` : '') ||
      '';
    if (candidateId && candidateId !== lastCreatedId) {
      setLastCreatedId(candidateId);
      lastSavedRef.current = candidateId;
      try {
        localStorage.setItem(storedIdKey, candidateId);
      } catch (_) {}
    }
    if (candidateVoucher && candidateVoucher !== lastVoucherRef.current) {
      setLastVoucher(candidateVoucher);
      lastVoucherRef.current = candidateVoucher;
      try {
        localStorage.setItem(`lastVoucher:${safeEntity}`, candidateVoucher);
      } catch (_) {}
    }
    if (candidateNumber) {
      setLastNumber(candidateNumber.toString());
      lastNumberRef.current = candidateNumber.toString();
      try {
        localStorage.setItem(`lastNumber:${safeEntity}`, candidateNumber.toString());
      } catch (_) {}
    }
    try {
      const rec = result || currentItem;
      if (rec?._id) setRecord(rec);
    } catch (_) {}
  }, [result, currentId, storedIdKey, lastCreatedId, safeEntity]);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const [offerSubTotal, setOfferSubTotal] = useState(0);
  const [renderTick, setRenderTick] = useState(0);
  const [journalLines, setJournalLines] = useState([]);
  const [journalHeaderDesc, setJournalHeaderDesc] = useState('');

  const setRecord = (rec) => {
    if (!rec?._id) return;
    lastRecordRef.current = rec;
    setLastCreatedId(rec._id);
    lastSavedRef.current = rec._id;
    try { localStorage.setItem(storedIdKey, rec._id); } catch (_) {}
    try {
      sessionStorage.setItem(`lastRecord:${safeEntity}`, JSON.stringify(rec));
      localStorage.setItem(`lastRecord:${safeEntity}`, JSON.stringify(rec));
    } catch (_) {}

    const voucher =
      rec.voucherNumber ||
      rec.displayNumber ||
      (rec.number ? `Vou-${String(rec.number).padStart(6, '0')}` : '');
    if (voucher) {
      setLastVoucher(voucher);
      lastVoucherRef.current = voucher;
      try { localStorage.setItem(`lastVoucher:${safeEntity}`, voucher); } catch (_) {}
    }
    if (rec.number) {
      const numStr = rec.number.toString();
      setLastNumber(numStr);
      lastNumberRef.current = numStr;
      try { localStorage.setItem(`lastNumber:${safeEntity}`, numStr); } catch (_) {}
    }
  };

  const getStoredRecord = () => {
    try {
      const rawSession = sessionStorage.getItem(`lastRecord:${safeEntity}`);
      const rawLocal = localStorage.getItem(`lastRecord:${safeEntity}`);
      const raw = rawSession || rawLocal;
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  };

  const firstRow = (resp) => {
    if (!resp) return null;
    if (Array.isArray(resp?.result)) return resp.result[0] || null;
    if (Array.isArray(resp?.data)) return resp.data[0] || null;
    if (Array.isArray(resp?.rows)) return resp.rows[0] || null;
    if (Array.isArray(resp?.result?.docs)) return resp.result.docs[0] || null;
    if (Array.isArray(resp?.docs)) return resp.docs[0] || null;
    return null;
  };

  useEffect(() => {
    const rec = getStoredRecord();
    if (rec?._id) {
      setRecord(rec);
    }
  }, []);

  // Helper to resolve and navigate to latest saved record
  const viewLatest = async ({ print = false, recordId = null } = {}) => {
    const reportCfg = getReportConfig(safeEntity);
    const hasLocalReport = localReportEntities.has(safeEntity);
    const goToRecord = (recordId) => {
      if (!recordId) return;
      if (print && (reportCfg || hasLocalReport)) {
        navigate(`/reports/${safeEntity}/${recordId}?autoload=1`);
        return;
      }
      navigate(`${basePath}/read/${recordId}${print ? '?print=1' : ''}`);
    };
    if (recordId) {
      goToRecord(recordId);
      return;
    }
    // Prefer the full cached record so we can reuse voucher/number
    let rec = lastRecordRef.current || getStoredRecord();
    if (rec?._id) {
      setRecord(rec);
    }

    // Step 1: use cached id/record
    let latestId = rec?._id || resolveLatestId();
    if (latestId) {
      goToRecord(latestId);
      return;
    }

    // Step 2: ask backend for the newest one
    try {
      const resp = await request.list({
        entity: safeEntity,
        options: { page: 1, items: 1, sortBy: 'createdAt', sortValue: -1 },
      });
      const first = firstRow(resp);
      if (first?._id) {
        setRecord(first);
        rec = first;
        latestId = first._id;
        goToRecord(latestId);
        return;
      }
    } catch (_) {}

    // Step 3: search by voucher/number (form -> cache)
    if (!latestId) {
      const num = form.getFieldValue('number');
      const voucherFromForm = num ? `Vou-${String(num).padStart(6, '0')}` : null;
      const voucherCandidates = [
        voucherFromForm,
        rec?.voucherNumber,
        rec?.displayNumber,
        lastVoucherRef.current,
        lastVoucher,
      ].filter(Boolean);
      const numberCandidates = [
        num,
        rec?.number,
        lastNumberRef.current,
        lastNumber,
      ].filter((v) => v !== undefined && v !== null && v !== '');

      for (const vch of voucherCandidates) {
        if (latestId) break;
        for (const field of ['voucherNumber', 'displayNumber']) {
          try {
            const resp = await request.filter({
              entity: safeEntity,
              options: { filter: field, equal: vch, items: 1 },
            });
            const first = firstRow(resp) || (Array.isArray(resp?.result) ? resp.result[0] : null);
            if (first?._id) {
              setRecord(first);
              rec = first;
              latestId = first._id;
              goToRecord(latestId);
              return;
            }
          } catch (_) {}
        }
      }

      for (const numCand of numberCandidates) {
        if (latestId) break;
        const numberQuery =
          numCand !== undefined && numCand !== null && numCand !== ''
            ? Number(numCand)
            : null;
        if (numberQuery === null || Number.isNaN(numberQuery)) continue;
        try {
          const resp = await request.filter({
            entity: safeEntity,
            options: { filter: 'number', equal: numberQuery, items: 1 },
          });
          const first = firstRow(resp) || (Array.isArray(resp?.result) ? resp.result[0] : null);
          if (first?._id) {
            setRecord(first);
            rec = first;
            latestId = first._id;
            goToRecord(latestId);
            return;
          }
        } catch (_) {}
      }
    }

    // Still nothing
    const hint =
      lastVoucherRef.current ||
      lastVoucher ||
      lastNumberRef.current ||
      lastNumber ||
      '';
    const suffix = hint ? ` (${hint})` : '';
    message.warning((translate('No record to view yet') || 'No record to view yet') + suffix);
  };
  const handleViewReport = () => {
    if (hasSavedThisSession && !isDirty) {
      viewLatest({ print: true });
      return;
    }
    pendingViewRef.current = { type: 'report' };
    form.submit();
  };
  const handelValuesChange = (changedValues, values) => {
    if (!isDirty) setIsDirty(true);
    const items = values['items'];
    let subTotal = 0;
    let subOfferTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          if (item.offerPrice && item.quantity) {
            let offerTotal = calculate.multiply(item['quantity'], item['offerPrice']);
            subOfferTotal = calculate.add(subOfferTotal, offerTotal);
          }
          if (item.quantity && item.price) {
            let total = calculate.multiply(item['quantity'], item['price']);
            //sub total
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
      setOfferSubTotal(subOfferTotal);
    }
    // For GLJournal totals preview
    if (entity === 'gljournal' && Array.isArray(values.lines)) {
      const sum = (arr, key) => arr.reduce((acc, it) => acc + (parseFloat(it?.[key]) || 0), 0);
      const totalDebit = sum(values.lines, 'debit');
      const totalCredit = sum(values.lines, 'credit');
      form.setFieldsValue({ totalDebit, totalCredit });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const newId =
        result?._id ||
        result?.id ||
        result?.result?._id ||
        result?.data?._id ||
        result?.insertedId ||
        null;
      if (result) {
        setRecord(result.result || result);
      }
      setHasSavedThisSession(true);
      setIsDirty(false);
      if (newId) {
        setLastCreatedId(newId);
        lastSavedRef.current = newId;
        try {
          localStorage.setItem(storedIdKey, newId);
          setStoredIdState(newId);
        } catch (_) {}
        // refresh from server to ensure we cache full voucher/number
        (async () => {
          try {
            const readResp = await request.read({ entity: safeEntity, id: newId });
            const rec = readResp?.result || readResp?.data || readResp;
            if (rec?._id) setRecord(rec);
          } catch (_) {}
        })();
      }
      // After journal creation, create lines
      if (entity === 'gljournal' && journalLines.length > 0 && result?._id) {
        const payloads = journalLines.map((l, idx) => {
          const p = (typeof l.particular === 'string') ? l.particular : '';
          return ({
            journal: result._id,
            lineNo: idx + 1,
            accountCode: l.postingcode || l.accountCode,
            particular: p,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          });
        });
        (async () => {
          try {
            await Promise.all(payloads.map((p) => request.post({ entity: 'gljournalline/create', jsonData: p })));
          } catch (e) {
            console.error('Failed to create journal lines', e);
          }
        })();
      }
      const pending = pendingViewRef.current;
      if (pending?.type === 'report') {
        pendingViewRef.current = null;
        viewLatest({ print: true, recordId: newId });
        return;
      }
      if (!stayOnCreateAfterSave) {
        form.resetFields();
        setSubTotal(0);
        setOfferSubTotal(0);
        setJournalLines([]);
        setJournalHeaderDesc('');
        // Force child form to remount so async selects refetch fresh lists
        setRenderTick((k) => k + 1);
      }
      dispatch(erp.resetAction({ actionType: 'create' }));
      dispatch(settingsAction.list({ entity: 'setting' }));
      // Auto-post Invoice JO so it's visible for approval
      (async () => {
        try {
          if (entity === 'invoicejo' && result?._id) {
            await request.update({ entity, id: result._id, jsonData: { status: 'Posted' } });
          }
        } catch {}
      })();
      if (!stayOnCreateAfterSave) {
        if (redirectPathAfterCreate) {
          navigate(redirectPathAfterCreate, { state: { createId: result?._id, entity } });
        } else if (redirectAfterCreate === 'list') {
          navigate(basePath);
        } else {
          navigate(`${basePath}/read/${result._id}`);
        }
      }
    }
    return () => {};
  }, [isSuccess]);

  const onSubmit = async (fieldsValue) => {
    // Removed malformed console.log that could break submit handler
    if (fieldsValue) {
      if (fieldsValue.items) {
        let newList = [...fieldsValue.items];
        newList.map((item) => {
          item.total = calculate.multiply(item.quantity, item.price);
        });
        fieldsValue = {
          ...fieldsValue,
          items: newList,
        };
      }
    }
    // For AP Customer-Invoice, compute subTotal/tax/total on client side to mimic Invoice behavior
    if (entity === 'apcustomerinvoice') {
      try {
        const vatRate = parseFloat(fieldsValue.taxRate || 0);
        const whtRate = parseFloat(fieldsValue.whtRate || 0);
        const stampRate = parseFloat(fieldsValue.stampRate || 0);
        const qt = Array.isArray(fieldsValue.items)
          ? fieldsValue.items.reduce((acc, it) => acc + (parseFloat(it.total) || (parseFloat(it.quantity||0) * parseFloat(it.price||0)) || 0), 0)
          : 0;
        const vRate = isNaN(vatRate) ? 0 : vatRate;
        const wRate = isNaN(whtRate) ? 0 : whtRate;
        const sRate = isNaN(stampRate) ? 0 : stampRate;
        const vat = calculate.roundUp2(calculate.multiply(qt, vRate / 100));
        const wht = calculate.roundUp2(calculate.multiply(qt, wRate / 100));
        const stamp = calculate.roundUp2(calculate.multiply(qt, sRate / 100));
        const tTotal = calculate.add(calculate.add(calculate.add(qt, vat), -wht), -stamp);
        fieldsValue.subTotal = calculate.roundUp2(qt);
        fieldsValue.taxTotal = calculate.roundUp2(vat);
        fieldsValue.whtTotal = calculate.roundUp2(wht);
        fieldsValue.stampTotal = calculate.roundUp2(stamp);
        fieldsValue.total = calculate.roundUp2(tTotal);
      } catch (e) { /* no-op */ }
    }
    // Auto-avoid duplicates for GL Account Group by picking next free code
    if (entity === 'glaccountgroup') {
      try {
        const cls = (fieldsValue.classCode || '').toString().padStart(2, '0');
        const grp = (fieldsValue.code || '').toString().padStart(2, '0');
        if (cls && grp) {
          const { success, result } = await request.filter({ entity: 'glaccountgroup', options: { filter: 'classCode', equal: cls } });
          if (success && Array.isArray(result)) {
            const exists = result.some((r)=> (r.code || '').toString() === grp);
            if (exists) {
              const { success: s2, result: r2 } = await request.get({ entity: `glaccountgroup/next-code?classCode=${cls}` });
              if (s2 && r2?.nextCode) fieldsValue.code = r2.nextCode;
            }
          }
        }
      } catch (e) {
        /* ignore; backend enforces uniqueness */
      }
    }
    if (entity === 'gljournal' && Array.isArray(fieldsValue.lines)) {
      const normalized = fieldsValue.lines.map((l)=>({
        ...l,
        particular: ((l?.particular ?? '') + '').trim(),
      }));
      setJournalLines(normalized);
      setJournalHeaderDesc(fieldsValue.description || '');
      const sum = (arr, key) => arr.reduce((acc, it) => acc + (parseFloat(it?.[key]) || 0), 0);
      const totalDebit = sum(normalized, 'debit');
      const totalCredit = sum(normalized, 'credit');
      fieldsValue.totalDebit = totalDebit;
      fieldsValue.totalCredit = totalCredit;
      const balanced = Math.abs((totalDebit || 0) - (totalCredit || 0)) < 0.0001;
      if (!balanced) {
        message.error('Total Debit must equal Total Credit');
        return;
      }
      // Use specialized endpoint to create journal + lines atomically
      try {
        const payload = {
          number: fieldsValue.number,
          date: fieldsValue.date?.toISOString?.() || fieldsValue.date,
          period: fieldsValue.period,
          source: fieldsValue.source || 'GJ',
          description: fieldsValue.description || '',
          status: fieldsValue.status || 'draft',
          currency: fieldsValue.currency || 'NGN',
          lines: normalized.map((l)=> ({
            postingcode: l.postingcode || l.accountCode,
            debit: parseFloat(l.debit)||0,
            credit: parseFloat(l.credit)||0,
            particular: l.particular || '',
          })),
        };
        const { success, result } = await request.post({ entity: 'gljournal/create-with-lines', jsonData: payload });
        if (success) {
          const journalRecord = result?.journal || result?.data || result;
          if (journalRecord?._id) {
            setRecord(journalRecord);
          }
          form.resetFields();
          setSubTotal(0);
          setOfferSubTotal(0);
          setJournalLines([]);
          setJournalHeaderDesc('');
          setRenderTick((k) => k + 1);
        if (stayOnCreateAfterSave) {
          setHasSavedThisSession(true);
          setIsDirty(false);
          const pending = pendingViewRef.current;
          if (pending?.type === 'report') {
            pendingViewRef.current = null;
            viewLatest({ print: true, recordId: journalRecord?._id || journalId });
            return;
          }
          message.success('Journal saved');
          return;
        }
          const journalId = journalRecord?._id || result?.journal?._id;
          if (redirectPathAfterCreate) {
            navigate(redirectPathAfterCreate, { state: { createId: journalRecord?._id, entity } });
          } else if (redirectAfterCreate === 'list') {
            navigate('/gljournal');
          } else if (journalId) {
            navigate(`/gljournal/read/${journalId}`);
          } else {
            navigate('/gljournal');
          }
        }
        return; // prevent default CRUD path
      } catch (e) {
        message.error('Failed to create journal');
        return;
      }
    }
    // Special handling: Job Order – support multi-line entry (one JO per row)
    if (entity === 'joborder') {
      try {
        const v = Number(fieldsValue.vatRate);
        const r = Number(fieldsValue.retentionRate);
        const w = Number(fieldsValue.whtRate);
        const s = Number(fieldsValue.stampDutyRate);
        const vatRate = !Number.isNaN(v) ? v / 100 : 0;
        const retentionRate = !Number.isNaN(r) ? r / 100 : 0;
        const whtRate = !Number.isNaN(w) ? w / 100 : 0;
        const stampDutyRate = !Number.isNaN(s) ? s / 100 : 0;

        // If items are provided, create one Job Order per item
        if (Array.isArray(fieldsValue.items) && fieldsValue.items.length > 0) {
          const header = {
            prId: fieldsValue.prId,
            budgetLineId: fieldsValue.budgetLineId,
            vendorId: fieldsValue.vendorId,
            startDate: fieldsValue.startDate,
            dueDate: fieldsValue.dueDate,
            vatRate,
            retentionRate,
            whtRate,
            stampDutyRate,
            currency: fieldsValue.currency || 'NGN',
          };

          const payloads = fieldsValue.items
            .filter((it) => it && (it.quantity || it.price))
            .map((it) => ({
              ...header,
              budgetLineId: it.itemName || header.budgetLineId,
              scope: (it.description || fieldsValue.scope || ''),
              unitPrice: parseFloat(it.price) || 0,
              qty: parseFloat(it.quantity) || 0,
            }));

          if (payloads.length > 0) {
            try {
              let lastCreated = null;
              // Create sequentially to avoid joNo collisions on the server
              for (const p of payloads) {
                // eslint-disable-next-line no-await-in-loop
                const resp = await request.create({ entity, jsonData: p });
                const created = resp?.result || resp?.data || resp;
                if (created?._id) {
                  lastCreated = created;
                }
              }
              form.resetFields();
              setSubTotal(0); setOfferSubTotal(0);
              message.success(`${payloads.length} Job Order(s) created`);
              if (lastCreated) {
                setRecord(lastCreated);
                setHasSavedThisSession(true);
                setIsDirty(false);
                const pending = pendingViewRef.current;
                if (pending?.type === 'report') {
                  pendingViewRef.current = null;
                  viewLatest({ print: true, recordId: lastCreated._id });
                  return;
                }
              }
              if (!stayOnCreateAfterSave) {
                navigate(basePath);
              }
            } catch (e) {
              message.error('Failed to create Job Orders');
            }
            return; // prevent default single-create path
          }
        }

        // No items list -> single create; transform % to decimals
        fieldsValue.vatRate = vatRate;
        fieldsValue.retentionRate = retentionRate;
        fieldsValue.whtRate = whtRate;
        fieldsValue.stampDutyRate = stampDutyRate;
      } catch {}
    }
    // Special handling: Invoice JO – compute amounts from items and tax rates like AP Customer-Invoice
    if (entity === 'invoicejo') {
      try {
        const vatRate = parseFloat(fieldsValue.taxRate || 0);
        const whtRate = parseFloat(fieldsValue.whtRate || 0);
        const stampRate = parseFloat(fieldsValue.stampRate || 0);
        const retentionRate = parseFloat(fieldsValue.retentionRate || 0);
        const qt = Array.isArray(fieldsValue.items)
          ? fieldsValue.items.reduce((acc, it) => acc + (parseFloat(it.total) || (parseFloat(it.quantity||0) * parseFloat(it.price||0)) || 0), 0)
          : 0;
        const vat = calculate.roundUp2(calculate.multiply(qt, (isNaN(vatRate)?0:vatRate) / 100));
        const wht = calculate.roundUp2(calculate.multiply(qt, (isNaN(whtRate)?0:whtRate) / 100));
        const stamp = calculate.roundUp2(calculate.multiply(qt, (isNaN(stampRate)?0:stampRate) / 100));
        const retention = calculate.roundUp2(calculate.multiply(qt, (isNaN(retentionRate)?0:retentionRate) / 100));
        const total = calculate.add(calculate.add(calculate.add(calculate.add(qt, vat), -wht), -stamp), -retention);
        fieldsValue.netAmount = calculate.roundUp2(qt);
        fieldsValue.vatAmount = vat;
        fieldsValue.grossAmount = total; // store Total in grossAmount
      } catch (e) { /* ignore; backend will validate */ }
    }
    dispatch(erp.create({ entity, jsonData: fieldsValue }));
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(basePath);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        // subTitle="This is create page"
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(basePath)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          !hideViewReport && (
            <Button
              key={`${uniqueId()}`}
              onClick={handleViewReport}
            >
              {safeEntity === 'gljournal'
                ? translate('View Journal') || 'View Journal'
                : safeEntity === 'invoice' || safeEntity === 'joborder' || safeEntity === 'invoicejo'
                  ? translate('View Voucher') || 'View Voucher'
                  : safeEntity === 'apcustomerinvoice'
                    ? translate('View Receipt') || 'View Receipt'
                    : translate('View Report') || 'View Report'}
            </Button>
          ),
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ].filter(Boolean)}
        style={{
          padding: '8px 0px',
        }}
      ></PageHeader>
      <Divider dashed style={{ margin: '8px 0' }} />
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          onValuesChange={handelValuesChange}
          initialValues={entity === 'joborder' ? { items: [{}] } : undefined}
        >
          <CreateForm
            subTotal={subTotal}
            offerTotal={offerSubTotal}
            refreshKey={renderTick}
            onViewLast={() => viewLatest({ print: false })}
            lastCreatedId={resolveLatestId()}
          />
        </Form>
      </Loading>
    </>
  );
}


