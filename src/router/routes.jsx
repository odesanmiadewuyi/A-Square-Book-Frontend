import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Company = lazy(() => import('@/pages/Company'));
const Leads = lazy(() => import('@/pages/Leads'));
const LeadOffers = lazy(() => import('@/pages/LeadOffers'));
const LeadOfferCreate = lazy(() => import('@/pages/LeadOffers/LeadOfferCreate'));
const LeadOfferRead = lazy(() => import('@/pages/LeadOffers/LeadOfferRead'));
const LeadOfferUpdate = lazy(() => import('@/pages/LeadOffers/LeadOfferUpdate'));
const People = lazy(() => import('@/pages/People'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazy(() => import('@/pages/Quote/index'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentCreate = lazy(() => import('@/pages/Payment/PaymentCreate'));
const ApprovedPayments = lazy(() => import('@/pages/Payment/Approved'));
const PaymentRecord = lazy(() => import('@/pages/Payment/Record'));
const PaymentPosting = lazy(() => import('@/pages/PaymentPosting'));
const PaymentJobOrders = lazy(() => import('@/pages/Payment/JobOrders'));
const APCustomerInvoicePay = lazy(() => import('@/pages/Payment/APCustomerInvoicePay'));
const APBillPage = lazy(() => import('@/pages/AP/Bill'));
const APPaymentPage = lazy(() => import('@/pages/AP/Payment'));
const APCustomerInvoice = lazy(() => import('@/pages/AP/CustomerInvoice'));
const APRequisition = lazy(() => import('@/pages/AP/Requisition'));
const APCustomerInvoiceApprove = lazy(() => import('@/pages/AP/CustomerInvoiceApprove'));
const JobOrderPage = lazy(() => import('@/pages/JobOrder'));
const JobOrderCreatePage = lazy(() => import('@/pages/JobOrder/JobOrderCreate'));
const InvoiceJOPage = lazy(() => import('@/pages/AP/InvoiceJO'));
const InvoiceJOCreate = lazy(() => import('@/pages/AP/InvoiceJOCreate'));
const InvoiceJOApprove = lazy(() => import('@/pages/AP/InvoiceJOApprove'));
const APCustomerInvoiceList = lazy(() => import('@/modules/APCustomerInvoiceModule/table/APCustomerInvoiceDataTableModule'));
const CreateAPCustomerInvoice = lazy(() => import('@/modules/APCustomerInvoiceModule/wrapper/CreateAPCustomerInvoiceModule'));
const ReadAPCustomerInvoice = lazy(() => import('@/modules/APCustomerInvoiceModule/wrapper/ReadAPCustomerInvoiceModule'));
const UpdateAPCustomerInvoice = lazy(() => import('@/modules/APCustomerInvoiceModule/wrapper/UpdateAPCustomerInvoiceModule'));
const VATDeductionPage = lazy(() => import('@/pages/Deductions/VATDeduction'));
const WHTDeductionPage = lazy(() => import('@/pages/Deductions/WHTDeduction'));
const StampDutyDeductionPage = lazy(() => import('@/pages/Deductions/StampDutyDeduction'));
const VendorsPage = lazy(() => import('@/pages/Vendor'));
const StaffPage = lazy(() => import('@/pages/Staff'));
const RoleTitlePage = lazy(() => import('@/pages/RoleTitle'));
const BudgetSettingsPage = lazy(() => import('@/pages/Settings/BudgetSettings'));
const BudgetFeatureSettingsPage = lazy(() => import('@/pages/Settings/BudgetFeature'));
const CustomerLedgerSettings = lazy(() => import('@/pages/Settings/CustomerLedger'));
const UserRolesSettings = lazy(() => import('@/pages/Settings/UserRoles'));
const AuditLogPage = lazy(() => import('@/pages/Settings/AuditLog'));
const BudgetVersionsPage = lazy(() => import('@/pages/Budget/Versions'));
const BudgetLinesPage = lazy(() => import('@/pages/Budget/Lines'));
const BudgetAmendmentsPage = lazy(() => import('@/pages/Budget/Amendments'));
const BudgetAmendmentApprovePage = lazy(() => import('@/pages/Budget/AmendmentApprove'));
const BudgetTransfersPage = lazy(() => import('@/pages/Budget/Transfers'));
const BudgetTransferApprovePage = lazy(() => import('@/pages/Budget/TransferApprove'));
const BudgetAvailabilityPage = lazy(() => import('@/pages/Budget/Availability'));
const DeliveryPage = lazy(() => import('@/pages/Delivery'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));
const Products = lazy(() => import('@/pages/Products'));
const ProductCreate = lazy(() => import('@/pages/Products/ProductCreate'));
const ProductRead = lazy(() => import('@/pages/Products/ProductRead'));
const ProductUpdate = lazy(() => import('@/pages/Products/ProductUpdate'));
const ProductsCategory = lazy(() => import('@/pages/ProductsCategory'));
const Department = lazy(() => import('@/pages/Department'));
const ProductCategoryCreate = lazy(() => import('@/pages/ProductsCategory/ProductCategoryCreate'));
const ProductCategoryRead = lazy(() => import('@/pages/ProductsCategory/ProductCategoryRead'));
const ProductCategoryUpdate = lazy(() => import('@/pages/ProductsCategory/ProductCategoryUpdate'));
const Order = lazy(() => import('@/pages/Order'));
const OrderCreate = lazy(() => import('@/modules/OrderModule/CreateOrderModule')); 
const OrderRead = lazy(() => import('@/modules/OrderModule/ReadOrderModule'));
const OrderUpdate = lazy(() => import('@/modules/OrderModule/UpdateOrderModule'));
const Expense = lazy(() => import('@/pages/Expense'));
const InvoiceDetail = lazy(() => import('@/pages/InvoiceDetail'));
const ExpenseCreate = lazy(() => import('@/modules/ExpenseModule/CreateExpenseModule'));
const ExpenseRead = lazy(() => import('@/modules/ExpenseModule/ReadExpenseModule'));
const ExpenseUpdate = lazy(() => import('@/modules/ExpenseModule/UpdateExpenseModule'));
const ExpenseCategory = lazy(() => import('@/pages/ExpenseCategory'));
const ExpenseCategoryCreate = lazy(() => import('@/modules/ExpenseCategoryModule/CreateExpenseCategoryModule'));
const ExpenseCategoryRead = lazy(() => import('@/modules/ExpenseCategoryModule/ReadExpenseCategoryModule'));
const ExpenseCategoryUpdate = lazy(() => import('@/modules/ExpenseCategoryModule/UpdateExpenseCategoryModule'));
const GLAccounts = lazy(() => import('@/pages/GL/Accounts'));
const CreateGLAccount = lazy(() => import('@/modules/GLAccountModule/wrapper/CreateGLAccountModule'));
const ReadGLAccount = lazy(() => import('@/modules/GLAccountModule/wrapper/ReadGLAccountModule'));
const UpdateGLAccount = lazy(() => import('@/modules/GLAccountModule/wrapper/UpdateGLAccountModule'));
const GLAccountClasses = lazy(() => import('@/pages/GL/Classes'));
const GLAccountGroups = lazy(() => import('@/pages/GL/Groups'));
const PostingAccounts = lazy(() => import('@/pages/GL/PostingAccounts'));
const GLJournals = lazy(() => import('@/pages/GL/Journals'));
const GLJournalApproval = lazy(() => import('@/pages/GL/JournalApproval'));
const GLPeriods = lazy(() => import('@/pages/GL/Periods'));
const GLAccountSubGroups = lazy(() => import('@/pages/GL/SubGroups'));
const CreateGLJournal = lazy(() => import('@/modules/GLJournalModule/wrapper/CreateGLJournalModule'));
const ReadGLJournal = lazy(() => import('@/modules/GLJournalModule/wrapper/ReadGLJournalModule'));
const UpdateGLJournal = lazy(() => import('@/modules/GLJournalModule/wrapper/UpdateGLJournalModule'));
const CreateGLPeriod = lazy(() => import('@/modules/GLPeriodModule/wrapper/CreateGLPeriodModule'));
const ReadGLPeriod = lazy(() => import('@/modules/GLPeriodModule/wrapper/ReadGLPeriodModule'));
const UpdateGLPeriod = lazy(() => import('@/modules/GLPeriodModule/wrapper/UpdateGLPeriodModule'));
const GLTrialBalance = lazy(() => import('@/pages/GL/TrialBalance'));
const GLBalanceSheet = lazy(() => import('@/pages/GL/BalanceSheet'));
const BankPage = lazy(() => import('@/pages/Bank'));
const BankTransfer = lazy(() => import('@/pages/Bank/Transfer'));
const BankReconcile = lazy(() => import('@/pages/Bank/Reconcile'));
const BankTransactionReport = lazy(() => import('@/pages/Bank/TransactionReport'));
const ARReceipt = lazy(() => import('@/pages/AR/Receipt'));
const ARReceiptsList = lazy(() => import('@/pages/AR/Receipts'));
const ARReceiptApproval = lazy(() => import('@/pages/AR/ReceiptApproval'));
const APBill = lazy(() => import('@/pages/AP/Bill'));
const APPayment = lazy(() => import('@/pages/AP/Payment'));
const ARAging = lazy(() => import('@/pages/AR/Aging'));
const ARStatement = lazy(() => import('@/pages/AR/Statement'));
const ARCreditNote = lazy(() => import('@/pages/AR/CreditNote'));
const ARWriteOff = lazy(() => import('@/pages/AR/WriteOff'));
const ARControlReconcile = lazy(() => import('@/pages/AR/ReconcileControl'));
const CreateBankModule = lazy(() => import('@/modules/BankModule/wrapper/CreateBankModule'));
const ReadBankModule = lazy(() => import('@/modules/BankModule/wrapper/ReadBankModule'));
const UpdateBankModule = lazy(() => import('@/modules/BankModule/wrapper/UpdateBankModule'));
const CreateGLAccountClass = lazy(() => import('@/modules/GLAccountClassModule/wrapper/CreateGLAccountClassModule'));
const ReadGLAccountClass = lazy(() => import('@/modules/GLAccountClassModule/wrapper/ReadGLAccountClassModule'));
const UpdateGLAccountClass = lazy(() => import('@/modules/GLAccountClassModule/wrapper/UpdateGLAccountClassModule'));
// GL Account Groups
const CreateGLAccountGroup = lazy(() => import('@/modules/GLAccountGroupModule/wrapper/CreateGLAccountGroupModule'));
const ReadGLAccountGroup = lazy(() => import('@/modules/GLAccountGroupModule/wrapper/ReadGLAccountGroupModule'));
const UpdateGLAccountGroup = lazy(() => import('@/modules/GLAccountGroupModule/wrapper/UpdateGLAccountGroupModule'));
// Posting Accounts
const CreatePostingAccount = lazy(() => import('@/modules/PostingAccountModule/wrapper/CreatePostingAccountModule'));
const ReadPostingAccount = lazy(() => import('@/modules/PostingAccountModule/wrapper/ReadPostingAccountModule'));
const UpdatePostingAccount = lazy(() => import('@/modules/PostingAccountModule/wrapper/UpdatePostingAccountModule'));
// GL Account Sub-Groups
const CreateGLAccountSubGroup = lazy(() => import('@/modules/GLAccountSubGroupModule/wrapper/CreateGLAccountSubGroupModule'));
const ReadGLAccountSubGroup = lazy(() => import('@/modules/GLAccountSubGroupModule/wrapper/ReadGLAccountSubGroupModule'));
const UpdateGLAccountSubGroup = lazy(() => import('@/modules/GLAccountSubGroupModule/wrapper/UpdateGLAccountSubGroupModule'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));
const VATSetup = lazy(() => import('@/pages/VATSetup'));
const StampDutySetup = lazy(() => import('@/pages/StampDutySetup'));
const RetentionSetup = lazy(() => import('@/pages/RetentionSetup'));
const ChartOfAccountsSettings = lazy(() => import('@/pages/ChartOfAccounts'));

const Profile = lazy(() => import('@/pages/Profile'));
const ReportViewer = lazy(() => import('@/pages/Reports/ReportViewer'));

const About = lazy(() => import('@/pages/About'));

let routes = {
  expense: [],
  default: [
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/settings/users',
      element: <UserRolesSettings />,
    },
    {
      path: '/login',
      element: <Navigate to='/' replace />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/companies',
      element: <Company />,
    },
    {
      path: '/people',
      element: <People />,
    },
    {
      path: '/leads',
      element: <Leads />,
    },
    {
      path: '/offers/leads',
      element: <LeadOffers />,
    },
    { path: '/gl/accounts', element: <GLAccounts /> },
    { path: '/gl/accounts/create', element: <CreateGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    { path: '/gl/accounts/read/:id', element: <ReadGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    { path: '/gl/accounts/update/:id', element: <UpdateGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    // GL Account Classes
    { path: '/gl/classes', element: <GLAccountClasses /> },
    { path: '/gl/classes/create', element: <CreateGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
    { path: '/gl/classes/read/:id', element: <ReadGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
    { path: '/gl/classes/update/:id', element: <UpdateGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
    // Groups listing
    { path: '/gl/groups', element: <GLAccountGroups /> },
    // GL Account Groups (second level)
    { path: '/gl/groups/create', element: <CreateGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup', redirectAfterCreate: 'list' }} /> },
    { path: '/gl/groups/read/:id', element: <ReadGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup' }} /> },
    { path: '/gl/groups/update/:id', element: <UpdateGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup' }} /> },
    // Posting Accounts
{ path: '/gl/postings', element: <PostingAccounts /> },
{ path: '/gl/postings/create', element: <CreatePostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount', redirectAfterCreate: 'list' }} /> },
{ path: '/gl/postings/read/:id', element: <ReadPostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount' }} /> },
{ path: '/gl/postings/update/:id', element: <UpdatePostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount' }} /> },
    // Legacy-style entity alias
    { path: '/postingaccount', element: <PostingAccounts /> },
{ path: '/postingaccount/create', element: <CreatePostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount', redirectAfterCreate: 'list' }} /> },
{ path: '/postingaccount/read/:id', element: <ReadPostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount' }} /> },
{ path: '/postingaccount/update/:id', element: <UpdatePostingAccount config={{ entity: 'postingaccount', PANEL_TITLE: 'Control Accounts', DATATABLE_TITLE: 'Control Accounts', ADD_NEW_ENTITY: 'Add New Control Account', ENTITY_NAME: 'postingaccount' }} /> },
    // GL Account Sub-Groups
    { path: '/gl/subgroups', element: <GLAccountSubGroups /> },
    { path: '/gl/subgroups/create', element: <CreateGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup', redirectAfterCreate: 'list' }} /> },
    { path: '/gl/subgroups/read/:id', element: <ReadGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup' }} /> },
        // Journals & Periods
    { path: '/gl/journals', element: <GLJournals /> },
    { path: '/gl/journal-approval', element: <GLJournalApproval /> },
    { path: '/gl/periods', element: <GLPeriods /> },
    { path: '/gl/trial-balance', element: <GLTrialBalance /> },
    { path: '/gl/balance-sheet', element: <GLBalanceSheet /> },
    // Bank setup
    { path: '/bank', element: <BankPage /> },
    { path: '/bank/create', element: <CreateBankModule config={{ entity: 'bank', PANEL_TITLE: 'Banks', DATATABLE_TITLE: 'Banks', ADD_NEW_ENTITY: 'Add New Bank', ENTITY_NAME: 'bank', redirectAfterCreate: 'list' }} /> },
    { path: '/bank/read/:id', element: <ReadBankModule config={{ entity: 'bank', PANEL_TITLE: 'Banks', DATATABLE_TITLE: 'Banks', ADD_NEW_ENTITY: 'Add New Bank', ENTITY_NAME: 'bank' }} /> },
    { path: '/bank/update/:id', element: <UpdateBankModule config={{ entity: 'bank', PANEL_TITLE: 'Banks', DATATABLE_TITLE: 'Banks', ADD_NEW_ENTITY: 'Add New Bank', ENTITY_NAME: 'bank' }} /> },
    { path: '/bank/transfer', element: <BankTransfer /> },
    { path: '/bank/reconcile', element: <BankReconcile /> },
    { path: '/bank/transactions/report', element: <BankTransactionReport /> },
    // Accounts Receivable
    { path: '/ar/receipt', element: <ARReceipt /> },
    { path: '/ar/receipts', element: <ARReceiptsList /> },
    { path: '/ar/receipt/approval', element: <ARReceiptApproval /> },
    { path: '/ap/bill', element: <APBill /> },
    { path: '/ap/payment', element: <APPayment /> },
    { path: '/ap/requisition', element: <APRequisition /> },
    { path: '/ap/joborder', element: <JobOrderPage /> },
    { path: '/ap/delivery', element: <DeliveryPage /> },
    // Budget module
    { path: '/settings/budget', element: <BudgetSettingsPage /> },
    { path: '/settings/budget-feature', element: <BudgetFeatureSettingsPage /> },
    { path: '/settings/users', element: <UserRolesSettings /> },
    { path: '/settings/audit-log', element: <AuditLogPage /> },
    { path: '/reports/:entity/:id', element: <ReportViewer /> },
    { path: '/budget/versions', element: <BudgetVersionsPage /> },
    { path: '/budget/lines', element: <BudgetLinesPage /> },
    { path: '/budget/amendments', element: <BudgetAmendmentsPage /> },
    { path: '/budget/amendments/approve/:id', element: <BudgetAmendmentApprovePage /> },
    { path: '/budget/transfers', element: <BudgetTransfersPage /> },
    { path: '/budget/transfers/approve/:id', element: <BudgetTransferApprovePage /> },
    { path: '/budget/availability', element: <BudgetAvailabilityPage /> },
    // Vendors under Settings
    { path: '/vendor', element: <VendorsPage /> },
    { path: '/staff', element: <StaffPage /> },
    { path: '/roletitle', element: <RoleTitlePage /> },
    { path: '/ar/aging', element: <ARAging /> },
    { path: '/ar/statement', element: <ARStatement /> },
    { path: '/ar/credit', element: <ARCreditNote /> },
    { path: '/ar/writeoff', element: <ARWriteOff /> },
    { path: '/ar/recon', element: <ARControlReconcile /> },
    // Journal CRUD
    { path: '/gljournal', element: <GLJournals /> },
    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list', stayOnCreateAfterSave: true }} /> },
    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },
    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },
    // Period CRUD
    { path: '/glperiod', element: <GLPeriods /> },
    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },
    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },
    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },
{ path: '/gl/subgroups/update/:id', element: <UpdateGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup' }} /> },
        // Journals & Periods\n    { path: '/gl/journals', element: <GLJournals /> },\n    { path: '/gl/periods', element: <GLPeriods /> },\n    { path: '/gljournal', element: <GLJournals /> },\n    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list' }} /> },\n    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/glperiod', element: <GLPeriods /> },\n    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },\n    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n// Aliases
    { path: '/glaccountgroup', element: <GLAccountGroups /> },
    { path: '/glaccountgroup/create', element: <CreateGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup', redirectAfterCreate: 'list' }} /> },
    { path: '/glaccountgroup/read/:id', element: <ReadGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup' }} /> },
    { path: '/glaccountgroup/update/:id', element: <UpdateGLAccountGroup config={{ entity: 'glaccountgroup', PANEL_TITLE: 'Account Groups', DATATABLE_TITLE: 'Account Groups', ADD_NEW_ENTITY: 'Add New Account Group', ENTITY_NAME: 'glaccountgroup' }} /> },
        // Journals & Periods\n    { path: '/gl/journals', element: <GLJournals /> },\n    { path: '/gl/periods', element: <GLPeriods /> },\n    { path: '/gljournal', element: <GLJournals /> },\n    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list' }} /> },\n    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/glperiod', element: <GLPeriods /> },\n    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },\n    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n// Aliases for Sub-Groups entity path
    { path: '/glaccountsubgroup', element: <GLAccountSubGroups /> },
    { path: '/glaccountsubgroup/create', element: <CreateGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup', redirectAfterCreate: 'list' }} /> },
    { path: '/glaccountsubgroup/read/:id', element: <ReadGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup' }} /> },
    { path: '/glaccountsubgroup/update/:id', element: <UpdateGLAccountSubGroup config={{ entity: 'glaccountsubgroup', PANEL_TITLE: 'Account Sub-Groups', DATATABLE_TITLE: 'Account Sub-Groups', ADD_NEW_ENTITY: 'Add New Account Sub-Group', ENTITY_NAME: 'glaccountsubgroup' }} /> },
        // Journals & Periods\n    { path: '/gl/journals', element: <GLJournals /> },\n    { path: '/gl/periods', element: <GLPeriods /> },\n    { path: '/gljournal', element: <GLJournals /> },\n    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list' }} /> },\n    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/glperiod', element: <GLPeriods /> },\n    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },\n    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n// Aliases for generic navigation
    { path: '/glaccountclass', element: <GLAccountClasses /> },
    { path: '/glaccountclass/create', element: <CreateGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
    { path: '/glaccountclass/read/:id', element: <ReadGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
    { path: '/glaccountclass/update/:id', element: <UpdateGLAccountClass config={{ entity: 'glaccountclass', PANEL_TITLE: 'Account Classes', DATATABLE_TITLE: 'Account Classes', ADD_NEW_ENTITY: 'Add New Account Class', ENTITY_NAME: 'glaccountclass' }} /> },
        // Journals & Periods\n    { path: '/gl/journals', element: <GLJournals /> },\n    { path: '/gl/periods', element: <GLPeriods /> },\n    { path: '/gljournal', element: <GLJournals /> },\n    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list' }} /> },\n    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/glperiod', element: <GLPeriods /> },\n    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },\n    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n// Aliases so generic panel navigation using entity "glaccount" works
    { path: '/glaccount', element: <GLAccounts /> },
    { path: '/glaccount/create', element: <CreateGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    { path: '/glaccount/read/:id', element: <ReadGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    { path: '/glaccount/update/:id', element: <UpdateGLAccount config={{ entity: 'glaccount', PANEL_TITLE: 'GL Accounts', DATATABLE_TITLE: 'GL Accounts', ADD_NEW_ENTITY: 'Add New GL Account', ENTITY_NAME: 'glaccount' }} /> },
    {
      path: '/expense',
      element: <Expense />,
    },
    {
      path: '/expense/create',
      element: (
        <ExpenseCreate
          config={{ entity: 'expense', PANEL_TITLE: 'Expense', DATATABLE_TITLE: 'Expense', ADD_NEW_ENTITY: 'Add New Expense', ENTITY_NAME: 'expense' }}
        />
      ),
    },
    {
      path: '/expense/read/:id',
      element: (
        <ExpenseRead
          config={{ entity: 'expense', PANEL_TITLE: 'Expense', DATATABLE_TITLE: 'Expense', ADD_NEW_ENTITY: 'Add New Expense', ENTITY_NAME: 'expense' }}
        />
      ),
    },
    {
      path: '/expense/update/:id',
      element: (
        <ExpenseUpdate
          config={{ entity: 'expense', PANEL_TITLE: 'Expense', DATATABLE_TITLE: 'Expense', ADD_NEW_ENTITY: 'Add New Expense', ENTITY_NAME: 'expense' }}
        />
      ),
    },
    {
      path: '/expensecategory',
      element: <ExpenseCategory />,
    },
    {
      path: '/expensecategory/create',
      element: (
        <ExpenseCategoryCreate
          config={{ entity: 'expensecategory', PANEL_TITLE: 'Expenses Category', DATATABLE_TITLE: 'Expenses Category', ADD_NEW_ENTITY: 'Add New Expense Category', ENTITY_NAME: 'expenses_category' }}
        />
      ),
    },
    {
      path: '/expensecategory/read/:id',
      element: (
        <ExpenseCategoryRead
          config={{ entity: 'expensecategory', PANEL_TITLE: 'Expenses Category', DATATABLE_TITLE: 'Expenses Category', ADD_NEW_ENTITY: 'Add New Expense Category', ENTITY_NAME: 'expenses_category' }}
        />
      ),
    },
    {
      path: '/expensecategory/update/:id',
      element: (
        <ExpenseCategoryUpdate
          config={{ entity: 'expensecategory', PANEL_TITLE: 'Expenses Category', DATATABLE_TITLE: 'Expenses Category', ADD_NEW_ENTITY: 'Add New Expense Category', ENTITY_NAME: 'expenses_category' }}
        />
      ),
    },
    {
      path: '/order',
      element: <Order />,
    },
    {
      path: '/order/create',
      element: <OrderCreate config={{ entity: 'order', PANEL_TITLE: 'Order', DATATABLE_TITLE: 'Order', ADD_NEW_ENTITY: 'Add New Order', ENTITY_NAME: 'order' }} />,
    },
    {
      path: '/order/read/:id',
      element: <OrderRead config={{ entity: 'order', PANEL_TITLE: 'Order', DATATABLE_TITLE: 'Order', ADD_NEW_ENTITY: 'Add New Order', ENTITY_NAME: 'order' }} />,
    },
    {
      path: '/order/update/:id',
      element: <OrderUpdate config={{ entity: 'order', PANEL_TITLE: 'Order', DATATABLE_TITLE: 'Order', ADD_NEW_ENTITY: 'Add New Order', ENTITY_NAME: 'order' }} />,
    },
    {
      path: '/product',
      element: <Products />,
    },
    {
      path: '/product/create',
      element: <ProductCreate />,
    },
    {
      path: '/product/read/:id',
      element: <ProductRead />,
    },
    {
      path: '/product/update/:id',
      element: <ProductUpdate />,
    },
    {
      path: '/productcategory',
      element: <ProductsCategory />,
    },
    {
      path: '/department',
      element: <Department />,
    },
    {
      path: '/productcategory/create',
      element: <ProductCategoryCreate />,
    },
    {
      path: '/productcategory/read/:id',
      element: <ProductCategoryRead />,
    },
    {
      path: '/productcategory/update/:id',
      element: <ProductCategoryUpdate />,
    },
        // Journals & Periods\n    { path: '/gl/journals', element: <GLJournals /> },\n    { path: '/gl/periods', element: <GLPeriods /> },\n    { path: '/gljournal', element: <GLJournals /> },\n    { path: '/gljournal/create', element: <CreateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal', redirectAfterCreate: 'list' }} /> },\n    { path: '/gljournal/read/:id', element: <ReadGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/gljournal/update/:id', element: <UpdateGLJournal config={{ entity: 'gljournal', PANEL_TITLE: 'Journals', DATATABLE_TITLE: 'Journals', ADD_NEW_ENTITY: 'Add New Journal', ENTITY_NAME: 'gljournal' }} /> },\n    { path: '/glperiod', element: <GLPeriods /> },\n    { path: '/glperiod/create', element: <CreateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod', redirectAfterCreate: 'list' }} /> },\n    { path: '/glperiod/read/:id', element: <ReadGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n    { path: '/glperiod/update/:id', element: <UpdateGLPeriod config={{ entity: 'glperiod', PANEL_TITLE: 'Periods', DATATABLE_TITLE: 'Periods', ADD_NEW_ENTITY: 'Add New Period', ENTITY_NAME: 'glperiod' }} /> },\n// Aliases to match entity-based navigation (entity = 'lead-offers')
    {
      path: '/lead-offers',
      element: <LeadOffers />,
    },
    {
      path: '/offers/leads/create',
      element: <LeadOfferCreate />,
    },
    {
      path: '/lead-offers/create',
      element: <LeadOfferCreate />,
    },
    {
      path: '/offers/leads/read/:id',
      element: <LeadOfferRead />,
    },
    {
      path: '/lead-offers/read/:id',
      element: <LeadOfferRead />,
    },
    {
      path: '/offers/leads/update/:id',
      element: <LeadOfferUpdate />,
    },
    {
      path: '/lead-offers/update/:id',
      element: <LeadOfferUpdate />,
    },
    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoicedetail',
      element: <InvoiceDetail />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/create',
      element: <PaymentCreate />,
    },
    {
      path: '/payment/approved',
      element: <ApprovedPayments />,
    },
    {
      path: '/payment/ap-customer-invoice',
      element: <APCustomerInvoicePay />,
    },
    {
      path: '/payment/record/:id',
      element: <PaymentRecord />,
    },
    {
      path: '/payment/postings',
      element: <PaymentPosting />,
    },
    {
      path: '/payment/job-orders',
      element: <PaymentJobOrders />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },
    // Accounts Payable
    {
      path: '/ap/bill',
      element: <APBillPage />,
    },
    {
      path: '/ap/payment',
      element: <APPaymentPage />,
    },
    {
      path: '/ap/invoicejo',
      element: <InvoiceJOPage />,
    },
    {
      path: '/ap/invoicejo/create',
      element: <InvoiceJOCreate />,
    },
    {
      path: '/ap/joborder/create',
      element: <JobOrderCreatePage />,
    },
    {
      path: '/ap/invoicejo/approve',
      element: <InvoiceJOApprove />,
    },
    // AP Customer-Invoice CRUD
  { path: '/ap/customer-invoice', element: <APCustomerInvoiceList config={{ entity: 'apcustomerinvoice', PANEL_TITLE: 'Customer-Invoice', DATATABLE_TITLE: 'Customer-Invoice', ADD_NEW_ENTITY: 'Add Customer Invoice', ENTITY_NAME: 'apcustomerinvoice', pathPrefix: 'ap/customer-invoice', addNewPath: '/ap/customer-invoice/create', dataTableColumns: [ { title: 'Number', dataIndex: 'number', render: (_ , r) => (r?.displayNumber || r?.voucherNumber || r?.number) }, { title: 'Date', dataIndex: 'date' }, { title: 'Description', dataIndex: 'notes' }, { title: 'Client', dataIndex: 'client', render: (_ , r) => (r?.client?.name || '') }, { title: 'Total', dataIndex: 'total' }, { title: 'Status', dataIndex: 'status' } ] }} /> },
  { path: '/ap/customer-invoice/create', element: <CreateAPCustomerInvoice config={{ entity: 'apcustomerinvoice', PANEL_TITLE: 'Customer-Invoice', DATATABLE_TITLE: 'Customer-Invoice', ADD_NEW_ENTITY: 'Add Customer Invoice', ENTITY_NAME: 'apcustomerinvoice', pathPrefix: 'ap/customer-invoice' }} /> },
  { path: '/ap/customer-invoice/read/:id', element: <ReadAPCustomerInvoice config={{ entity: 'apcustomerinvoice', PANEL_TITLE: 'Customer-Invoice', DATATABLE_TITLE: 'Customer-Invoice', ADD_NEW_ENTITY: 'Add Customer Invoice', ENTITY_NAME: 'apcustomerinvoice', pathPrefix: 'ap/customer-invoice' }} /> },
  { path: '/ap/customer-invoice/update/:id', element: <UpdateAPCustomerInvoice config={{ entity: 'apcustomerinvoice', PANEL_TITLE: 'Customer-Invoice', DATATABLE_TITLE: 'Customer-Invoice', ADD_NEW_ENTITY: 'Add Customer Invoice', ENTITY_NAME: 'apcustomerinvoice', pathPrefix: 'ap/customer-invoice' }} /> },
  { path: '/ap/customer-invoice/approve', element: <APCustomerInvoiceApprove /> },
    { path: '/ap/vat-deductions', element: <VATDeductionPage /> },
    { path: '/ap/wht-deductions', element: <WHTDeductionPage /> },
    { path: '/ap/stamp-duty-deductions', element: <StampDutyDeductionPage /> },

    { path: '/settings', element: <Settings /> },
    { path: '/settings/edit/:settingsKey', element: <Settings /> },
    { path: '/settings/:settingsKey', element: <Settings /> },
    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/wht-setup',
      element: <Taxes />,
    },
    {
      path: '/taxes',
      element: <Navigate to='/wht-setup' replace />,
    },
    {
      path: '/vat-setup',
      element: <VATSetup />,
    },
    {
      path: '/stamp-duty-setup',
      element: <StampDutySetup />,
    },
    {
      path: '/retention-setup',
      element: <RetentionSetup />,
    },
    {
      path: '/settings/chart-of-accounts',
      element: <ChartOfAccountsSettings />,
    },
    {
      path: '/settings/customer-ledger',
      element: <CustomerLedgerSettings />,
    },

    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;










