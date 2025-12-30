import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ErpLayout } from '@/layout';
import ReportFrame from '@/components/Report/ReportFrame';
import { getReportConfig } from '@/config/reports';
import NotFound from '@/components/NotFound';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import GLJournalLocalReport from './GLJournalLocalReport';
import ARReceiptLocalReport from './ARReceiptLocalReport';
import ARReceiptListReport from './ARReceiptListReport';
import InvoiceLocalReport from './InvoiceLocalReport';
import BankListReport from './BankListReport';
import ProductListReport from './ProductListReport';
import ProductCategoryListReport from './ProductCategoryListReport';
import VendorListReport from './VendorListReport';
import BankTransferListReport from './BankTransferListReport';
import StaffListReport from './StaffListReport';
import BudgetVersionListReport from './BudgetVersionListReport';
import BudgetLineListReport from './BudgetLineListReport';
import BudgetAmendmentListReport from './BudgetAmendmentListReport';
import BudgetTransferListReport from './BudgetTransferListReport';
import DepartmentListReport from './DepartmentListReport';
import APCustomerInvoiceLocalReport from './APCustomerInvoiceLocalReport';
import ClientListReport from './ClientListReport';
import PeopleListReport from './PeopleListReport';
import CompanyListReport from './CompanyListReport';
import JobOrderLocalReport from './JobOrderLocalReport';
import InvoiceJOLocalReport from './InvoiceJOLocalReport';

const PAINT_DELAY_MS = 250;
const AUTO_PRINT_DELAY_MS = 1500;
const AUTO_PRINT_PREVIEW_DELAY_MS = 800;
const AUTO_PRINT_POLL_MS = 200;

export default function ReportViewer() {
  const { entity, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateReturnTo = location.state?.from;
  const normalizedEntity = (entity || '').toLowerCase();
  const cfg = getReportConfig(entity);
  const supportsLocal = [
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
    'client',
    'people',
    'company',
    'companies',
    'joborder',
    'invoicejo',
  ].includes(normalizedEntity);
  const autoLoad = useMemo(() => searchParams.get('autoload') === '1', [searchParams]);
  const autoPrint = useMemo(() => searchParams.get('print') === '1', [searchParams]);
  const returnTo = useMemo(() => {
    if (stateReturnTo) return stateReturnTo;
    const fromParam = searchParams.get('from');
    if (!fromParam) return '';
    try {
      return decodeURIComponent(fromParam);
    } catch {
      return fromParam;
    }
  }, [searchParams, stateReturnTo]);
  const [isLoaded, setIsLoaded] = useState(autoLoad);
  const [reportKey, setReportKey] = useState(0);
  const reportIdentity = `${normalizedEntity}-${id}`;
  const reportLoadKey = `${reportIdentity}-${reportKey}`;
  const [readySignature, setReadySignature] = useState('');
  const [printedSignature, setPrintedSignature] = useState('');
  const [hasPainted, setHasPainted] = useState(false);
  const reportBodyRef = useRef(null);
  const isReportReady = readySignature === reportLoadKey;
  const hasPrinted = printedSignature === reportIdentity;
  const isReceiptList = normalizedEntity === 'arreceipt' && id === 'list';

  if (!id || (!cfg && !supportsLocal)) {
    return (
      <ErpLayout>
        <NotFound entity={entity || 'report'} />
      </ErpLayout>
    );
  }

  const params = cfg ? { [cfg.param]: id } : {};
  const reportTitles = {
    gljournal: 'JOURNAL Report',
    arreceipt: 'RECEIPT Report',
    invoice: 'INVOICE Report',
    bank: 'BANKS Report',
    product: 'PRODUCTS Report',
    productcategory: 'PRODUCT CATEGORIES Report',
    vendor: 'VENDORS Report',
    banktransfer: 'BANK TRANSFER Report',
    staff: 'STAFF Report',
    budgetversion: 'BUDGET VERSIONS Report',
    budgetline: 'BUDGET LINES Report',
    budgetamendment: 'BUDGET AMENDMENTS Report',
    budgettransfer: 'BUDGET TRANSFERS Report',
    department: 'DEPARTMENTS Report',
    apcustomerinvoice: 'CUSTOMER INVOICE Report',
    client: 'CLIENTS Report',
    people: 'PEOPLE Report',
    company: 'COMPANIES Report',
    companies: 'COMPANIES Report',
    joborder: 'JOB ORDER Report',
    invoicejo: 'INVOICE JO Report',
  };
  const title = reportTitles[normalizedEntity] || `${(entity || 'report').toUpperCase()} Report`;
  const documentTitles = {
    gljournal: 'Journal Voucher',
    invoice: 'Invoice Voucher',
    bank: 'Bank List',
    product: 'Product List',
    productcategory: 'Product Category List',
    vendor: 'Vendor List',
    banktransfer: 'Bank Transfer List',
    staff: 'Staff List',
    budgetversion: 'Budget Versions',
    budgetline: 'Budget Lines',
    budgetamendment: 'Budget Amendments',
    budgettransfer: 'Budget Transfers',
    department: 'Department List',
    apcustomerinvoice: 'Customer Invoice',
    client: 'Client List',
    people: 'People List',
    company: 'Company List',
    companies: 'Company List',
    joborder: 'Job Order Voucher',
    invoicejo: 'Invoice JO Voucher',
  };
  const documentTitle = documentTitles[normalizedEntity] || title;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = documentTitle;
    return () => {
      document.title = prevTitle;
    };
  }, [documentTitle]);
  const handleLoad = () => {
    setIsLoaded(true);
    setReportKey((k) => k + 1);
  };
  const handleReportReady = useCallback(() => {
    setReadySignature(reportLoadKey);
  }, [reportLoadKey]);

  const isAutoPrintReady = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const body = reportBodyRef.current;
    if (!body) return true;
    if (body.querySelector('.ant-spin')) return false;
    const frame = body.querySelector('iframe');
    if (frame) {
      try {
        const doc = frame.contentDocument;
        if (doc && doc.readyState !== 'complete') return false;
      } catch (_) {
        return true;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    setHasPainted(false);
  }, [reportLoadKey]);

  useEffect(() => {
    if (!isLoaded || !isReportReady) return;
    let raf1;
    let raf2;
    let timer;
    const markPainted = () => setHasPainted(true);
    if (typeof window === 'undefined') {
      markPainted();
      return undefined;
    }
    if (typeof window.requestAnimationFrame !== 'function') {
      timer = setTimeout(markPainted, PAINT_DELAY_MS);
      return () => clearTimeout(timer);
    }
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        timer = setTimeout(markPainted, PAINT_DELAY_MS);
      });
    });
    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [isLoaded, isReportReady, reportLoadKey]);

  useEffect(() => {
    if (!autoPrint || !isLoaded || !isReportReady || !hasPainted || hasPrinted) return;
    let raf1;
    let raf2;
    let delayTimer;
    let pollTimer;
    let previewTimer;
    let didPrint = false;
    const triggerPrint = () => {
      if (didPrint) return;
      didPrint = true;
      setPrintedSignature(reportIdentity);
      if (typeof window === 'undefined') return;
      if (typeof window.requestAnimationFrame !== 'function') {
        window.print();
        return;
      }
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          window.print();
        });
      });
    };
    const schedulePrint = () => {
      if (previewTimer || didPrint) return;
      previewTimer = setTimeout(() => {
        if (didPrint) return;
        if (!isAutoPrintReady()) {
          previewTimer = null;
          pollTimer = setTimeout(checkReady, AUTO_PRINT_POLL_MS);
          return;
        }
        triggerPrint();
      }, AUTO_PRINT_PREVIEW_DELAY_MS);
    };
    const checkReady = () => {
      if (didPrint) return;
      if (!isAutoPrintReady()) {
        pollTimer = setTimeout(checkReady, AUTO_PRINT_POLL_MS);
        return;
      }
      schedulePrint();
    };
    delayTimer = setTimeout(checkReady, AUTO_PRINT_DELAY_MS);
    return () => {
      clearTimeout(delayTimer);
      if (pollTimer) clearTimeout(pollTimer);
      if (previewTimer) clearTimeout(previewTimer);
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [
    autoPrint,
    isLoaded,
    isReportReady,
    hasPainted,
    hasPrinted,
    reportIdentity,
    isAutoPrintReady,
  ]);

  return (
    <ErpLayout>
      <style>
        {`@media print {
          .report-viewer__controls { display: none !important; }
          aside, header, .ant-layout-sider { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
          .report-viewer__card { box-shadow: none !important; border: none !important; }
        }`}
      </style>
      <div style={{ padding: 20, background: '#f5f5f5' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e6edf3',
            overflow: 'hidden',
          }}
          className="report-viewer__card"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: '14px 18px',
              borderBottom: '1px solid #eef2f6',
              background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
            }}
          >
            <div />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textAlign: 'center' }}>
              {title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }} className="report-viewer__controls">
              {!isLoaded && (
                <Button size="small" type="primary" onClick={handleLoad}>
                  Load Report
                </Button>
              )}
              {isLoaded && (
                <Button
                  size="small"
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  disabled={!isReportReady}
                >
                  Print
                </Button>
              )}
              <Button size="small" onClick={() => (returnTo ? navigate(returnTo) : navigate(-1))}>
                Cancel
              </Button>
            </div>
          </div>
          <div ref={reportBodyRef} style={{ padding: 12, background: '#f8fafc' }}>
            {isLoaded ? (
              supportsLocal ? (
                normalizedEntity === 'gljournal' ? (
                  <GLJournalLocalReport id={id} onReady={handleReportReady} />
                ) : normalizedEntity === 'arreceipt' ? (
                  isReceiptList ? (
                    <ARReceiptListReport onReady={handleReportReady} />
                  ) : (
                    <ARReceiptLocalReport id={id} onReady={handleReportReady} />
                  )
                ) : normalizedEntity === 'invoice' ? (
                  <InvoiceLocalReport id={id} onReady={handleReportReady} />
                ) : normalizedEntity === 'bank' ? (
                  <BankListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'product' ? (
                  <ProductListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'client' ? (
                  <ClientListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'vendor' ? (
                  <VendorListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'banktransfer' ? (
                  <BankTransferListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'people' ? (
                  <PeopleListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'company' || normalizedEntity === 'companies' ? (
                  <CompanyListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'staff' ? (
                  <StaffListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'budgetversion' ? (
                  <BudgetVersionListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'budgetline' ? (
                  <BudgetLineListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'budgetamendment' ? (
                  <BudgetAmendmentListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'budgettransfer' ? (
                  <BudgetTransferListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'department' ? (
                  <DepartmentListReport onReady={handleReportReady} />
                ) : normalizedEntity === 'apcustomerinvoice' ? (
                  <APCustomerInvoiceLocalReport id={id} onReady={handleReportReady} />
                ) : normalizedEntity === 'joborder' ? (
                  <JobOrderLocalReport id={id} onReady={handleReportReady} />
                ) : normalizedEntity === 'invoicejo' ? (
                  <InvoiceJOLocalReport id={id} onReady={handleReportReady} />
                ) : (
                  <ProductCategoryListReport onReady={handleReportReady} />
                )
              ) : (
                <ReportFrame
                  key={reportKey}
                  path={cfg.path}
                  params={params}
                  height="78vh"
                  onLoad={handleReportReady}
                />
              )
            ) : (
              <div
                style={{
                  height: '78vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  border: '1px dashed #cbd5f5',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: 13,
                }}
              >
                Click "Load Report" to display the voucher.
              </div>
            )}
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}
