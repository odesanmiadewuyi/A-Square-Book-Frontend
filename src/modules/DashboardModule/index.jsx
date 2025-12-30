import { useEffect, useState } from 'react';

import { Tag, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';

import { useMoney } from '@/settings';

import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';

import RecentTable from './components/RecentTable';

import SummaryCard from './components/SummaryCard';
import PreviewCard from './components/PreviewCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';

import { selectMoneyFormat } from '@/redux/settings/selectors';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { useSelector } from 'react-redux';
import { isPrivilegedRole } from '@/auth/roles';

export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);
  const currentAdmin = useSelector(selectCurrentAdmin);
  const role = currentAdmin?.role;
  const modules = Array.isArray(currentAdmin?.allowedModules) ? currentAdmin.allowedModules : [];
  const allowAll = !modules || modules.length === 0 || isPrivilegedRole(role);
  const canSales = allowAll || modules.includes('sales');
  const canCRM = allowAll || modules.includes('crm');

  const getStatsData = async ({ entity, currency }) => {
    return await request.summary({
      entity,
      options: { currency },
    });
  };

  const {
    result: invoiceResult,
    isLoading: invoiceLoading,
    onFetch: fetchInvoicesStats,
  } = useOnFetch();

  const { result: quoteResult, isLoading: quoteLoading, onFetch: fetchQuotesStats } = useOnFetch();

  const {
    result: paymentResult,
    isLoading: paymentLoading,
    onFetch: fetchPayemntsStats,
  } = useOnFetch();

  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    canCRM ? request.summary({ entity: 'client' }) : Promise.resolve(null)
  );

  useEffect(() => {
    const currency = money_format_settings?.default_currency_code || null;

    if (currency && canSales) {
      fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
      fetchQuotesStats(getStatsData({ entity: 'quote', currency }));
      fetchPayemntsStats(getStatsData({ entity: 'payment', currency }));
    }
  }, [money_format_settings?.default_currency_code, canSales]);

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },

    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const entityData = [
    canSales && {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Invoices'),
    },
    canSales && {
      result: quoteResult,
      isLoading: quoteLoading,
      entity: 'quote',
      title: translate('quote'),
    },
  ].filter(Boolean);

  const statisticCards = entityData.map((data, index) => {
    const { result, entity, isLoading, title } = data;

    return (
      <PreviewCard
        key={index}
        title={title}
        isLoading={isLoading}
        entity={entity}
        statistics={
          !isLoading &&
          result?.performance?.map((item) => ({
            tag: item?.status,
            color: 'blue',
            value: item?.percentage,
          }))
        }
      />
    );
  });

  if (money_format_settings) {
    return (
      <>
        <Row gutter={[32, 32]}>
          {canSales && (
            <>
              <SummaryCard
                title={translate('Invoices')}
                prefix={translate('This month')}
                isLoading={invoiceLoading}
                data={invoiceResult?.total}
              />
              <SummaryCard
                title={translate('Quote')}
                prefix={translate('This month')}
                isLoading={quoteLoading}
                data={quoteResult?.total}
              />
              <SummaryCard
                title={translate('paid')}
                prefix={translate('This month')}
                isLoading={paymentLoading}
                data={paymentResult?.total}
              />
              <SummaryCard
                title={translate('Unpaid')}
                prefix={translate('Not Paid')}
                isLoading={invoiceLoading}
                data={invoiceResult?.total_undue}
              />
            </>
          )}
        </Row>
        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          {canSales && (
            <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 18 }}>
              <div className="whiteBox shadow" style={{ height: 458 }}>
                <Row className="pad20" gutter={[0, 0]}>
                  {statisticCards}
                </Row>
              </div>
            </Col>
          )}
          {canCRM && (
            <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 6 }}>
              <CustomerPreviewCard
                isLoading={clientLoading}
                activeCustomer={clientResult?.active}
                newCustomer={clientResult?.new}
              />
            </Col>
          )}
        </Row>
        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          {canSales && (
            <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
              <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
                <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                  {translate('Recent Invoices')}
                </h3>

                <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
              </div>
            </Col>
          )}

          {canSales && (
            <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
              <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
                <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                  {translate('Recent Quotes')}
                </h3>
                <RecentTable entity={'quote'} dataTableColumns={dataTableColumns} />
              </div>
            </Col>
          )}
        </Row>
      </>
    );
  } else {
    return <></>;
  }
}
