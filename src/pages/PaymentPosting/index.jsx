import React from 'react';
import { useDispatch } from 'react-redux';
import { message, Modal, Descriptions, Button, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';
import { CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { request } from '@/request';
import { crud } from '@/redux/crud/actions';
import SelectAsync from '@/components/SelectAsync';

export default function PaymentPosting() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const entity = 'paymentposting';
  const [postModalOpen, setPostModalOpen] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(null);
  const [bankId, setBankId] = React.useState('');

  const dataTableColumns = [
    { title: translate('Voucher Number') || 'Voucher Number', dataIndex: 'voucherNumber' },
    { title: translate('Reference') || 'Reference', dataIndex: 'ref' },
    { title: translate('Amount') || 'Amount', dataIndex: 'amount' },
    { title: translate('Bank') || 'Bank', dataIndex: ['bank', 'name'] },
    { title: translate('Date') || 'Date', dataIndex: 'date' },
    { title: translate('Status') || 'Status', dataIndex: 'status' },
  ];

  const postRows = async (rows) => {
    const ids = rows
      .filter((r) => r && r._id && r.status !== 'posted')
      .map((r) => r._id);
    if (ids.length === 0) {
      message.info(translate('Nothing to post') || 'Nothing to post');
      return;
    }
    try {
      const resp = await request.post({ entity: `${entity}/post`, jsonData: { ids } });
      if (resp?.success) message.success(`${translate('Posted') || 'Posted'}: ${resp?.result?.posted?.length || 0}`);
    } catch (e) {}
    dispatch(crud.list({ entity, options: { filter: 'status', equal: 'unposted' } }));
  };

  const handleMenuAction = async (action, record) => {
    if (action !== 'post') return;
    // Open modal to choose a bank and show details, then post
    setCurrentRow(record);
    const b = record?.bank?._id || record?.bank || '';
    setBankId(b);
    setPostModalOpen(true);
  };

  const config = {
    entity,
    PANEL_TITLE: translate('Payment Postings') || 'Payment Postings',
    DATATABLE_TITLE: translate('Payment Posting List') || 'Payment Posting List',
    ADD_NEW_ENTITY: translate('Payment Posting') || 'Payment Posting',
    ENTITY_NAME: translate('Payment Posting') || 'Payment Posting',
    dataTableColumns,
    disableCreate: true,
    disableEdit: true,
    disableDelete: true,
    defaultListOptions: { filter: 'status', equal: 'unposted' },
    selectionType: 'radio',
    menuExtra: [
      {
        key: 'post',
        label: translate('Post') || 'Post',
        icon: <CheckOutlined />,
        disabled: (record) => record?.status === 'posted',
      },
    ],
    onMenuAction: handleMenuAction,
    selectionActions: [
      {
        key: 'selectOne',
        label: translate('Select') || 'Select',
        icon: <CheckOutlined />,
        onAction: (rows) => {
          const r = Array.isArray(rows) ? rows[0] : null;
          if (!r) { message.info('Select one row'); return; }
          handleMenuAction('post', r);
        },
      },
    ],
  };

  return (
    <>
      <CrudModule config={config} />
      <PostDialog
        open={postModalOpen}
        onCancel={() => setPostModalOpen(false)}
        record={currentRow}
        bankId={bankId}
        setBankId={setBankId}
        onPosted={() => { setPostModalOpen(false); dispatch(crud.list({ entity, options: { filter: 'status', equal: 'unposted' } })); }}
      />
    </>
  );
}

export function PostDialog({ open, onCancel, record, bankId, setBankId, onPosted }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const entity = 'paymentposting';
  const [payDate, setPayDate] = React.useState(null);
  const [narration, setNarration] = React.useState('');
  const [tellerNo, setTellerNo] = React.useState('');
  const [newRef, setNewRef] = React.useState('');
  React.useEffect(()=>{
    if (record?.date) setPayDate(dayjs(record.date));
    else setPayDate(dayjs());
    setNarration(record?.description || '');
    setTellerNo(record?.tellerNo || '');
    // Always generate a new reference in INVAPAY###### format
    (async () => {
      try {
        const resp = await request.get({ entity: 'payment/next-ref' });
        const r = resp?.result?.ref || '';
        const digits = (r.match(/(\d+)/) || [,'1'])[1];
        const formatted = `INVAPAY${String(digits).padStart(6,'0')}`;
        setNewRef(formatted);
      } catch { setNewRef('INVAPAY000001'); }
    })();
  }, [record?._id]);
  const handlePost = async () => {
    if (!record?._id) return;
    if (!bankId) { message.error('Please select a Bank'); return; }
    try {
      await request.update({ entity, id: record._id, jsonData: { bank: bankId, date: payDate?.toISOString?.() || record?.date, description: narration, tellerNo, ref: newRef } });
    } catch {}
    try {
      const resp = await request.post({ entity: `${entity}/post`, jsonData: { ids: [record._id] } });
      if (resp?.success) {
        message.success(`${translate('Posted') || 'Posted'}: ${resp?.result?.posted?.length || 0}`);
        if (typeof onPosted === 'function') onPosted();
      }
    } catch {}
  };

  return (
    <Modal
      className="postPaymentModal"
      title={translate('Post Payment') || 'Post Payment'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={560}
    >
      {record && (
        <>
          <div className="postPaymentSummary">
            <Descriptions size='small' column={2} bordered>
            <Descriptions.Item label={translate('Voucher') || 'Voucher'}>{record.voucherNumber}</Descriptions.Item>
            <Descriptions.Item label={translate('Reference') || 'Reference'}>{newRef || 'INVAPAY000001'}</Descriptions.Item>
            <Descriptions.Item label={translate('Amount') || 'Amount'}>{record.amount}</Descriptions.Item>
            <Descriptions.Item label={translate('Status') || 'Status'}>{record.status}</Descriptions.Item>
            </Descriptions>
          </div>
          <div className="postPaymentGrid">
            <div className="postPaymentField span-2">
              <div className="postPaymentField-label">{translate('Bank') || 'Bank'}</div>
              <SelectAsync
                entity={'bank'}
                outputValue={'_id'}
                displayLabels={['name','accountNumber','postingAccountCode']}
                placeholder={translate('Select Bank') || 'Select Bank'}
                value={bankId}
                onChange={(v)=> setBankId(v)}
                listOptions={{ filter: 'enabled', equal: true }}
                size='small'
                style={{ width: '100%' }}
              />
            </div>
            <div className="postPaymentField">
              <div className="postPaymentField-label">{translate('Date') || 'Date'}</div>
              <DatePicker
                showTime
                style={{ width: '100%' }}
                value={payDate}
                onChange={(d)=> setPayDate(d)}
                size='small'
              />
            </div>
            <div className="postPaymentField">
              <div className="postPaymentField-label">{translate('Teller/Cheque No') || 'Teller/Cheque No'}</div>
              <Input
                value={tellerNo}
                onChange={(e)=> setTellerNo(e.target.value)}
                placeholder={translate('Enter teller/cheque number') || 'Enter teller/cheque number'}
                size='small'
              />
            </div>
            <div className="postPaymentField span-2">
              <div className="postPaymentField-label">{translate('Narration') || 'Narration'}</div>
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 2 }}
                value={narration}
                onChange={(e)=> setNarration(e.target.value)}
              />
            </div>
          </div>
          <div className="postPaymentActions">
            <Button type='primary' onClick={handlePost} icon={<CheckOutlined />}>{translate('Post') || 'Post'}</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
