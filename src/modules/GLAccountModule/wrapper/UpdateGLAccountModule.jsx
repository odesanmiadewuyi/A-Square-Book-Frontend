import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import GLAccountForm from '../Forms/GLAccountForm';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export default function UpdateGLAccountModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  useLayoutEffect(() => { dispatch(erp.read({ entity: config.entity, id })); }, [id]);
  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);
  useLayoutEffect(() => { if (currentResult) dispatch(erp.currentAction({ actionType: 'update', data: currentResult })); }, [currentResult]);
  if (isLoading) return (<ErpLayout><PageLoader/></ErpLayout>);
  return (
    <ErpLayout>
      {isSuccess ? <UpdateItem config={config} UpdateForm={GLAccountForm} /> : <NotFound entity={config.entity} />}
    </ErpLayout>
  );
}

