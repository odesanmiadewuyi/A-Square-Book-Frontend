import { useLayoutEffect } from 'react';

import DataTable from './DataTable';

import Delete from './DeleteItem';

import { useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';

import { useErpContext } from '@/context/erp';
import usePermissionConfig from '@/auth/usePermissionConfig';

export default function ErpPanel({ config, extra }) {
  const dispatch = useDispatch();
  const { state } = useErpContext();
  const { deleteModal } = state;
  const { effectiveConfig } = usePermissionConfig(config);

  const dispatcher = () => {
    dispatch(erp.resetState());
  };

  useLayoutEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  if (effectiveConfig.readDenied) {
    return (
      <div style={{ padding: 16 }}>
        Access denied for this module.
      </div>
    );
  }

  return (
    <>
      <DataTable config={effectiveConfig} extra={extra} />
      <Delete config={effectiveConfig} isOpen={deleteModal.isOpen} />
    </>
  );
}
