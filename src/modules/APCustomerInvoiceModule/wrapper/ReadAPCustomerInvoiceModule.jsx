import PageLoader from '@/components/PageLoader';
import { ErpLayout } from '@/layout';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ReadAPCustomerInvoiceModule({ config }){
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    if (!id) return;
    navigate(`/reports/${config.entity}/${id}?autoload=1`, { replace: true });
  }, [id, navigate, config.entity]);

  return (
    <ErpLayout>
      <PageLoader />
    </ErpLayout>
  );
}
