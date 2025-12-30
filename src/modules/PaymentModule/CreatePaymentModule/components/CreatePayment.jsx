import React, { useEffect, useState } from 'react';
import { Row, Col, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { erp } from '@/redux/erp/actions';

// Reuse the existing RecordPayment UI for invoice payments
import Payment from '@/modules/InvoiceModule/RecordPaymentModule/components/Payment';

export default function CreatePayment({ config }) {
  const translate = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [invoiceId, setInvoiceId] = useState();
  const [invoice, setInvoice] = useState();

  // Load invoice details when one is selected
  useEffect(() => {
    (async () => {
      if (!invoiceId) return;
      try {
        const { success, result } = await request.read({ entity: 'invoice', id: invoiceId });
        if (success) {
          setInvoice(result);
          // Sync redux expectations for RecordPayment flow
          dispatch(erp.currentItem({ data: result }));
          dispatch(erp.currentAction({ actionType: 'recordPayment', data: result }));
        }
      } catch (e) {}
    })();
  }, [invoiceId]);

  return (
    <>
      <Row gutter={[8, 8]}>
        <Col className="gutter-row" xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 20, push: 2 }}>
          <PageHeader
            onBack={() => navigate('/payment')}
            title={translate('Record Payment') || 'Record Payment'}
            ghost={false}
            style={{ padding: '10px 0px' }}
          />
          <Divider dashed style={{ margin: '8px 0' }} />
        </Col>
      </Row>

      <Row gutter={[8, 8]}>
        <Col className="gutter-row" xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12, push: 6 }} lg={{ span: 8, push: 8 }}>
          <SelectAsync
            entity={'invoice'}
            displayLabels={['displayNumber']}
            outputValue={'_id'}
            placeholder={translate('Select Invoice') || 'Select Invoice'}
            listOptions={{ filter: 'approved', equal: true }}
            onChange={(val) => setInvoiceId(val)}
            remoteSearch
            size="middle"
          />
        </Col>
      </Row>

      {invoice && (
        <Payment config={config} currentItem={invoice} />
      )}
    </>
  );
}
