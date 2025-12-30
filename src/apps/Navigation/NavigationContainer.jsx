import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import { useSelector } from 'react-redux';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.svg';
import logoText from '@/style/images/logo-text.svg';

import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  ReconciliationOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { isPrivilegedRole } from '@/auth/roles';

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const role = currentAdmin?.role;
  const modules = Array.isArray(currentAdmin?.allowedModules) ? currentAdmin.allowedModules : [];
  const allowAll = !modules || modules.length === 0 || isPrivilegedRole(role);

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'gl',
      icon: <ReconciliationOutlined />,
      label: translate('General Ledger') || 'General Ledger',
      children: [
        {
          key: 'gl/accounts',
          icon: <TagsOutlined />,
          label: <Link to={'/gl/accounts'}>{translate('Chart of Accounts') || 'GL Accounts'}</Link>,
        },
        {
          key: 'gl/classes',
          icon: <TagsOutlined />,
          label: <Link to={'/gl/classes'}>{'Account Classes'}</Link>,
        },
        {
          key: 'gl/groups',
          icon: <TagsOutlined />,
          label: <Link to={'/gl/groups'}>{'Account Groups'}</Link>,
        },
        {
          key: 'gl/subgroups',
          icon: <TagsOutlined />,
          label: <Link to={'/gl/subgroups'}>{'Account Sub-Groups'}</Link>,
        },
        {
          key: 'gl/postings',
          icon: <TagsOutlined />,
          label: <Link to={'/gl/postings'}>{'Control Accounts'}</Link>,
        },
        {
          key: 'gl/journals',
          icon: <FileOutlined />,
          label: <Link to={'/gl/journals'}>{translate('Journals') || 'GL Journals'}</Link>,
        },
        {
          key: 'gl/journal-approval',
          icon: <FileOutlined />,
          label: <Link to={'/gl/journal-approval'}>{'Journal Approval'}</Link>,
        },
        {
          key: 'gl/periods',
          icon: <ContainerOutlined />,
          label: <Link to={'/gl/periods'}>{translate('Periods') || 'GL Periods'}</Link>,
        },
        {
          key: 'gl/trial-balance',
          icon: <ReconciliationOutlined />,
          label: <Link to={'/gl/trial-balance'}>{'Trial Balance'}</Link>,
        },
        {
          key: 'gl/balance-sheet',
          icon: <ReconciliationOutlined />,
          label: <Link to={'/gl/balance-sheet'}>{'Balance Sheet'}</Link>,
        },
      ],
    },
    // Sales module
    {
      key: 'sales',
      icon: <ContainerOutlined />,
      label: translate('Sales') || 'Sales',
      children: [
        { key: 'order', icon: <ContainerOutlined />, label: <Link to={'/order'}>{translate('order') || 'Order'}</Link> },
        { key: 'quote', icon: <FileSyncOutlined />, label: <Link to={'/quote'}>{translate('quote')}</Link> },
        { key: 'payment', icon: <CreditCardOutlined />, label: <Link to={'/payment'}>{translate('payments')}</Link> },
        { key: 'payment/ap-customer-invoice', icon: <CreditCardOutlined />, label: <Link to={'/payment/ap-customer-invoice'}>{'Pay Customer-Invoice (AP)'}</Link> },
        { key: 'payment/job-orders', icon: <CreditCardOutlined />, label: <Link to={'/payment/job-orders'}>{'Payment - Job Orders'}</Link> },
        // Accounts Receivable
        { key: 'ar/receipts', icon: <CreditCardOutlined />, label: <Link to={'/ar/receipts'}>{'AR Receipts'}</Link> },
        { key: 'ar/receipt-approval', icon: <CreditCardOutlined />, label: <Link to={'/ar/receipt/approval'}>{'AR Receipt Approval'}</Link> },
        { key: 'ar/aging', icon: <CreditCardOutlined />, label: <Link to={'/ar/aging'}>{'AR Aging'}</Link> },
        { key: 'ar/statement', icon: <CreditCardOutlined />, label: <Link to={'/ar/statement'}>{'AR Statement'}</Link> },
        { key: 'ar/credit', icon: <CreditCardOutlined />, label: <Link to={'/ar/credit'}>{'AR Credit Note'}</Link> },
        { key: 'ar/writeoff', icon: <CreditCardOutlined />, label: <Link to={'/ar/writeoff'}>{'AR Write-Off'}</Link> },
        { key: 'ar/recon', icon: <CreditCardOutlined />, label: <Link to={'/ar/recon'}>{'AR vs GL Control'}</Link> },
      ],
    },
    // Payment module (top-level)
    {
      key: 'payments-module',
      icon: <CreditCardOutlined />,
      label: translate('Payments') || 'Payments',
      children: [
        { key: 'payments/list', icon: <CreditCardOutlined />, label: <Link to={'/payment'}>{translate('payments') || 'Payments'}</Link> },
        { key: 'payments/job-orders', icon: <CreditCardOutlined />, label: <Link to={'/payment/job-orders'}>{'Payment - Job Orders'}</Link> },
        { key: 'payments/postings', icon: <CreditCardOutlined />, label: <Link to={'/payment/postings'}>{translate('Payment Postings') || 'Payment Postings'}</Link> },
      ],
    },
    // Accounts Payable module (top-level)
    {
      key: 'ap-module',
      icon: <ContainerOutlined />,
      label: translate('Accounts Payable') || 'Accounts Payable',
      children: [
        { key: 'apm/bill', icon: <FileOutlined />, label: <Link to={'/ap/bill'}>{'Vendor Bill'}</Link> },
        { key: 'apm/payment', icon: <CreditCardOutlined />, label: <Link to={'/ap/payment'}>{'Vendor Payment'}</Link> },
            { key: 'apm/customer-invoice', icon: <FileOutlined />, label: <Link to={'/ap/customer-invoice'}>{'Customer-Invoice'}</Link> },
            { key: 'apm/customer-invoice-approve', icon: <FileOutlined />, label: <Link to={'/ap/customer-invoice/approve'}>{'Approve Customer-Invoice'}</Link> },
      ],
    },
    // Accounts Payable (AP)
    {
      key: 'ap',
      icon: <ContainerOutlined />,
      label: 'Purchases / AP',
      children: [
        { key: 'ap/bill', icon: <FileOutlined />, label: <Link to={'/ap/bill'}>{'AP Bill'}</Link> },
        { key: 'ap/payment', icon: <CreditCardOutlined />, label: <Link to={'/ap/payment'}>{'AP Payment'}</Link> },
        { key: 'ap/customer-invoice', icon: <FileOutlined />, label: <Link to={'/ap/customer-invoice'}>{'Customer-Invoice'}</Link> },
        { key: 'ap/joborder', icon: <FileOutlined />, label: <Link to={'/ap/joborder'}>{'Job Orders'}</Link> },
        { key: 'ap/joborder/create', icon: <FileOutlined />, label: <Link to={'/ap/joborder/create'}>{'Add Job Order'}</Link> },
        { key: 'ap/invoicejo', icon: <FileOutlined />, label: <Link to={'/ap/invoicejo'}>{'Invoice JO'}</Link> },
        { key: 'ap/invoicejo/create', icon: <FileOutlined />, label: <Link to={'/ap/invoicejo/create'}>{'Add Invoice JO'}</Link> },
        { key: 'ap/invoicejo/approve', icon: <FileOutlined />, label: <Link to={'/ap/invoicejo/approve'}>{'Approve Invoice JO'}</Link> },
        { key: 'ap/delivery', icon: <FileOutlined />, label: <Link to={'/ap/delivery'}>{'GRN / Service Cert'}</Link> },
        { key: 'ap/requisition', icon: <FileOutlined />, label: <Link to={'/ap/requisition'}>{'Requisitions'}</Link> },
      ],
    },
    // Banks module
    {
      key: 'banks',
      icon: <WalletOutlined />,
      label: translate('Banks') || 'Banks',
      children: [
        { key: 'banks/setup', icon: <WalletOutlined />, label: <Link to={'/bank'}>{'Bank Setup'}</Link> },
        { key: 'banks/transfer', icon: <WalletOutlined />, label: <Link to={'/bank/transfer'}>{'Transfer Funds'}</Link> },
        { key: 'banks/reconcile', icon: <WalletOutlined />, label: <Link to={'/bank/reconcile'}>{'Reconcile'}</Link> },
        { key: 'banks/transactions-report', icon: <WalletOutlined />, label: <Link to={'/bank/transactions/report'}>{'Bank Transactions Report'}</Link> },
      ],
    },
    // Products module
    {
      key: 'products',
      icon: <TagsOutlined />,
      label: translate('products') || 'Products',
      children: [
        { key: 'product', icon: <TagsOutlined />, label: <Link to={'/product'}>{translate('products')}</Link> },
        { key: 'productcategory', icon: <FilterOutlined />, label: <Link to={'/productcategory'}>{translate('products_category')}</Link> },
      ],
    },
    // CRM module
    {
      key: 'crm',
      icon: <CustomerServiceOutlined />,
      label: translate('CRM') || 'CRM',
      children: [
        { key: 'customer', icon: <CustomerServiceOutlined />, label: <Link to={'/customer'}>{translate('customers')}</Link> },
        { key: 'people', icon: <UserOutlined />, label: <Link to={'/people'}>{translate('peoples')}</Link> },
        { key: 'companies', icon: <ShopOutlined />, label: <Link to={'/companies'}>{translate('companies')}</Link> },
        { key: 'leads', icon: <TagOutlined />, label: <Link to={'/leads'}>{translate('leads')}</Link> },
        { key: 'offers/leads', icon: <FileOutlined />, label: <Link to={'/offers/leads'}>{translate('offers_for_leads')}</Link> },
      ],
    },
    // Expenses module
    {
      key: 'expenses-module',
      icon: <ContainerOutlined />,
      label: translate('expenses') || 'Expenses',
      children: [
        { key: 'expense', icon: <ContainerOutlined />, label: <Link to={'/expense'}>{translate('expenses') || 'Expenses'}</Link> },
        { key: 'expensecategory', icon: <FilterOutlined />, label: <Link to={'/expensecategory'}>{translate('expenses_category') || 'Expenses Category'}</Link> },
        { key: 'invoice', icon: <ContainerOutlined />, label: <Link to={'/invoice'}>{`${translate('expenses') || 'Expenses'} - ${translate('invoices') || 'Invoices'}`}</Link> },
        { key: 'invoicedetail', icon: <FileOutlined />, label: <Link to={'/invoicedetail'}>{`${translate('expenses') || 'Expenses'} - ${translate('Invoice Details') || 'Invoice Details'}`}</Link> },
        { key: 'payment/approved', icon: <CreditCardOutlined />, label: <Link to={'/payment/approved'}>{`${translate('expenses') || 'Expenses'} - ${translate('Approved Invoices') || 'Approved Invoices'}`}</Link> },
      ],
    },
    // Settings module
    {
      key: 'settings-module',
      icon: <SettingOutlined />,
      label: translate('settings') || 'Settings',
      children: [
        { key: 'settings', icon: <SettingOutlined />, label: <Link to={'/settings'}>{translate('settings')}</Link> },
        { key: 'settings/users', icon: <UserOutlined />, label: <Link to={'/settings/users'}>{translate('admin_list') || 'Users & Roles'}</Link> },
        { key: 'payment/mode', icon: <WalletOutlined />, label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link> },
        { key: 'bank', icon: <WalletOutlined />, label: <Link to={'/bank'}>{'Banks'}</Link> },
        { key: 'settings/chart-of-accounts', icon: <TagsOutlined />, label: <Link to={'/settings/chart-of-accounts'}>{'Control Accounts'}</Link> },
        { key: 'settings/customer-ledger', icon: <TagsOutlined />, label: <Link to={'/settings/customer-ledger'}>{'Customer Ledger'}</Link> },
        { key: 'settings/budget', icon: <TagsOutlined />, label: <Link to={'/settings/budget'}>{'Budget Settings'}</Link> },
        { key: 'settings/budget-feature', icon: <TagsOutlined />, label: <Link to={'/settings/budget-feature'}>{'Budget Feature'}</Link> },
        { key: 'settings/vendors', icon: <ShopOutlined />, label: <Link to={'/vendor'}>{'Vendors'}</Link> },
        { key: 'settings/staff', icon: <UserOutlined />, label: <Link to={'/staff'}>{'Staff'}</Link> },
        { key: 'settings/roletitle', icon: <TagsOutlined />, label: <Link to={'/roletitle'}>{'Roles / Titles'}</Link> },
        { key: 'settings/audit-log', icon: <TagsOutlined />, label: <Link to={'/settings/audit-log'}>{'Audit Log'}</Link> },
        { key: 'wht-setup', icon: <ShopOutlined />, label: <Link to={'/wht-setup'}>{translate('taxes')}</Link> },
        { key: 'vat-setup', icon: <ShopOutlined />, label: <Link to={'/vat-setup'}>{'VAT-Setup'}</Link> },
        { key: 'stamp-duty-setup', icon: <ShopOutlined />, label: <Link to={'/stamp-duty-setup'}>{'Stamp-duty Setup'}</Link> },
        { key: 'retention-setup', icon: <ShopOutlined />, label: <Link to={'/retention-setup'}>{'Retention Setup'}</Link> },
        { key: 'department', icon: <TagsOutlined />, label: <Link to={'/department'}>{translate('Department') || 'Department'}</Link> },
      ],
    },
    {
      key: 'budget',
      icon: <ReconciliationOutlined />,
      label: 'Budget',
      children: [
        { key: 'budget/versions', icon: <FileOutlined />, label: <Link to={'/budget/versions'}>{'Versions'}</Link> },
        { key: 'budget/lines', icon: <FileOutlined />, label: <Link to={'/budget/lines'}>{'Lines'}</Link> },
        { key: 'budget/amendments', icon: <FileOutlined />, label: <Link to={'/budget/amendments'}>{'Amendments'}</Link> },
        { key: 'budget/transfers', icon: <FileOutlined />, label: <Link to={'/budget/transfers'}>{'Transfers'}</Link> },
        { key: 'budget/availability', icon: <FileOutlined />, label: <Link to={'/budget/availability'}>{'Availability'}</Link> },
      ],
    },
    {
      key: 'about',
      label: <Link to={'/about'}>{translate('about')}</Link>,
      icon: <ReconciliationOutlined />,
    },
  ];

  const moduleKeyByItem = {
    gl: 'gl',
    sales: 'sales',
    'payments-module': 'sales',
    'ap-module': 'ap',
    ap: 'ap',
    banks: 'bank',
    products: 'products',
    crm: 'crm',
    'expenses-module': 'expenses',
    'settings-module': 'settings',
    budget: 'budget',
  };

  const filteredItems = items
    .filter(Boolean)
    .map((item) => {
      const mk = moduleKeyByItem[item.key];
      // Hide About when user is restricted to specific modules
      if (!allowAll && item.key === 'about') return null;
      if (!allowAll && mk && !modules.includes(mk)) {
        return null;
      }
      const children = item.children ? item.children.filter(Boolean) : undefined;
      return { ...item, ...(children ? { children } : {}) };
    })
    .filter(Boolean);

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',

        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          // border: 'none',
          ['left']: '20px',
          top: '20px',
          // borderRadius: '8px',
        }),
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
        }}
      >
        <img src={logoIcon} alt="Logo" style={{ marginLeft: '-5px', height: '40px' }} />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="Logo"
            style={{
              marginTop: '3px',
              marginLeft: '10px',
              height: '38px',
            }}
          />
        )}
      </div>
      <Menu
        items={filteredItems}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          width: 256,
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ ['marginLeft']: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        // style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}



