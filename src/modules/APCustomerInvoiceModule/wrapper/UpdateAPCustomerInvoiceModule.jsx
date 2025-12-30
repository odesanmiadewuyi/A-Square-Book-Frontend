import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import APCustomerInvoiceForm from '../Forms/APCustomerInvoiceForm';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export default function UpdateAPCustomerInvoiceModule({ config }){
  const dispatch = useDispatch();
  const { id } = useParams();
  useLayoutEffect(()=>{ dispatch(erp.read({ entity: config.entity, id })); }, [id]);
  const { result, isSuccess, isLoading=true } = useSelector(selectReadItem);
  if (isLoading) return (<ErpLayout><PageLoader /></ErpLayout>);
  return (
    <ErpLayout>
      {isSuccess ? (<UpdateItem config={config} UpdateForm={APCustomerInvoiceForm} />) : (<NotFound entity={config.entity} />)}
    </ErpLayout>
  );
}

