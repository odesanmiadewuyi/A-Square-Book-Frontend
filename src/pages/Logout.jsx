import { useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '@/redux/auth/actions';
import { crud } from '@/redux/crud/actions';
import { erp } from '@/redux/erp/actions';
import PageLoader from '@/components/PageLoader';

const clearUiMasks = () => {
  try {
    document.body?.classList?.remove('ant-scrolling-effect');
    document.body?.style?.removeProperty('overflow');
    document.body?.style?.removeProperty('overflow-x');
    document.body?.style?.removeProperty('overflow-y');
    document.body?.style?.removeProperty('width');
    document.querySelectorAll('.ant-modal-root, .ant-modal-mask, .ant-drawer-mask').forEach((el) => {
      el?.parentNode?.removeChild?.(el);
    });
  } catch (_) {}
};

const Logout = () => {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
    dispatch(erp.resetState());
  }, []);

  useEffect(() => {
    dispatch(logoutAction()).finally(() => {
      clearUiMasks();
      // Use hard redirect to ensure app is fully reset after logout.
      window.location.replace('/login');
    });
  }, []);

  return <PageLoader />;
};
export default Logout;
