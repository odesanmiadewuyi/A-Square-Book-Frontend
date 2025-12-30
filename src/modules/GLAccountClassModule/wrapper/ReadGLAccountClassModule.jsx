import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import GLAccountClassForm from '../Forms/GLAccountClassForm';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export default function ReadGLAccountClassModule({ config }){
  const dispatch = useDispatch();
  const { id } = useParams();
  useLayoutEffect(()=>{ dispatch(erp.read({ entity: config.entity, id })); },[id]);
  const { result, isSuccess, isLoading=true } = useSelector(selectReadItem);
  if (isLoading) return (<ErpLayout><PageLoader/></ErpLayout>);
  return (
    <ErpLayout>
      {isSuccess ? <ReadItem config={config} ReadForm={GLAccountClassForm}/> : <NotFound entity={config.entity}/>} 
    </ErpLayout>
  );
}

