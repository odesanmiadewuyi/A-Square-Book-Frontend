import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLayoutEffect } from 'react';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import PageLoader from '@/components/PageLoader';
import NotFound from '@/components/NotFound';
import ReportButton from '@/components/Report/ReportButton';
import { getReportConfig } from '@/config/reports';

export default function ReadGLJournalModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const reportCfg = getReportConfig('gljournal');

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      {isSuccess ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            {reportCfg && currentResult?._id && (
              <ReportButton
                path={reportCfg.path}
                params={{ [reportCfg.param]: currentResult._id }}
                label="Print Journal"
                size="small"
              />
            )}
          </div>
          <ReadItem config={config} selectedItem={currentResult} />
        </>
      ) : (
        <NotFound entity={config.entity} />
      )}
    </ErpLayout>
  );
}
