import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import ReportButton from '@/components/Report/ReportButton';
import { getReportConfig } from '@/config/reports';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useParams, useLocation } from 'react-router-dom';

export default function ReadInvoiceModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const printOnLoad = new URLSearchParams(location.search).get('print') === '1';

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);
  const reportCfg = getReportConfig('invoice');

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              {reportCfg && currentResult?._id && (
                <ReportButton
                  path={reportCfg.path}
                  params={{ [reportCfg.param]: currentResult._id }}
                  label="Print Invoice"
                  size="small"
                />
              )}
            </div>
            <ReadItem config={config} selectedItem={currentResult} printOnLoad={printOnLoad} />
          </>
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
