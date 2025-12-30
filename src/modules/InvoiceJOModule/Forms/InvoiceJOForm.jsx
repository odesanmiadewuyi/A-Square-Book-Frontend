import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, DatePicker, Row, Col, Divider, Typography, Select, Button } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import calculate from '@/utils/calculate';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import { useLocation } from 'react-router-dom';
import './InvoiceJOForm.css';

export default function InvoiceJOForm({ refreshKey }) {
  const form = Form.useFormInstance();
  const location = useLocation();
  const [nextNumber, setNextNumber] = useState('');
  const [deptId, setDeptId] = useState();
  const [currentJO, setCurrentJO] = useState();
  const [filteredJOId, setFilteredJOId] = useState();
  // Tax states (percent) and totals
  const [vatRate, setVatRate] = useState(0);
  const [whtRate, setWhtRate] = useState(0);
  const [stampRate, setStampRate] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [vatTotal, setVatTotal] = useState(0);
  const [whtTotal, setWhtTotal] = useState(0);
  const [stampTotal, setStampTotal] = useState(0);
  const [retentionTotal, setRetentionTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const items = Form.useWatch('items', form) || [];
  const [subTotal, setSubTotal] = useState(0);
  const selectedDeliveryId = Form.useWatch('deliveryId', form);
  const netAmount = subTotal;
  const addField = useRef(null);
  
  // Load next Invoice JO number for display and set on form
  useEffect(() => {
    // On create route, make sure any lingering selection is cleared
    try {
      const isCreate = (location?.pathname || '').toLowerCase().endsWith('/create');
      if (isCreate) {
        // Clear fields that could cling from a previous navigation
        try { form.resetFields(['deliveryId', 'joId', 'vendorId', 'budgetLineId']); } catch {}
        form.setFieldsValue({ deliveryId: undefined, joId: undefined, vendorId: undefined, budgetLineId: undefined });
        setCurrentJO(undefined);
        setFilteredJOId(undefined);
      }
    } catch {}
    (async () => {
      try {
        const { success, result } = await request.get({ entity: 'invoicejo/next-number' });
        if (success && result?.display) {
          setNextNumber(result.display);
          form.setFieldsValue({ invoiceNo: result.display });
        }
      } catch {}
    })();
  }, []);

  const handleJOChange = async (joId, skipClear = false) => {
    try {
      setCurrentJO(joId);
      // Reset selected delivery reference whenever JO changes (unless change came from delivery selection)
      if (!skipClear) form.setFieldsValue({ deliveryId: undefined });
      if (!joId) { setDeptId(undefined); return; }
      const { success, result } = await request.read({ entity: 'joborder', id: joId });
      if (success && result) {
        // Suggest vendor and budget line from JO
        const vendor = result?.vendorId?._id || result?.vendorId;
        const budgetLine = result?.budgetLineId?._id || result?.budgetLineId;
        form.setFieldsValue({ vendorId: vendor, budgetLineId: budgetLine });
        // Load department from linked PR for filtering budget lines
        const prId = result?.prId?._id || result?.prId;
        if (prId) {
          try {
            const pr = await request.read({ entity: 'requisition', id: prId });
            const dep = pr?.result?.department?._id || pr?.result?.department;
            setDeptId(dep);
          } catch {}
        }
      }
    } catch {}
  };
  // React whenever delivery selection changes to sync linked fields (vendor, JO, etc.)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!selectedDeliveryId) {
          if (alive) {
            setFilteredJOId(undefined);
            setCurrentJO(undefined);
          }
          return;
        }
        const { success, result } = await request.read({ entity: 'delivery', id: selectedDeliveryId });
        if (!alive) return;
        if (success && result) {
          const v = result?.vendorId?._id || result?.vendorId;
          const jo = result?.joId?._id || result?.joId;
          const patch = {};
          if (v) patch.vendorId = v;
          if (jo) {
            patch.joId = jo;
            setFilteredJOId(jo);
            setCurrentJO(jo);
            try { await handleJOChange(jo, true); } catch {}
          }
          if (Object.keys(patch).length) form.setFieldsValue(patch);
        }
      } catch { /* ignore */ }
    })();
    return () => { alive = false; };
  }, [selectedDeliveryId]);

  // Handlers for selecting tax configurations
  const handleVatChange = async (id) => {
    if (!id || id === 'redirectURL') {
      setVatRate(0);
      form.setFieldsValue({ taxRate: 0 });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'vatsetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setVatRate(v);
      form.setFieldsValue({ taxRate: v });
    } catch {
      setVatRate(0);
      form.setFieldsValue({ taxRate: 0 });
    }
  };
  const handleWhtChange = async (id) => {
    if (!id || id === 'redirectURL') {
      setWhtRate(0);
      form.setFieldsValue({ whtRate: 0 });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'taxes', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setWhtRate(v);
      form.setFieldsValue({ whtRate: v });
    } catch {
      setWhtRate(0);
      form.setFieldsValue({ whtRate: 0 });
    }
  };
  const handleStampChange = async (id) => {
    if (!id || id === 'redirectURL') {
      setStampRate(0);
      form.setFieldsValue({ stampRate: 0 });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'stampdutysetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setStampRate(v);
      form.setFieldsValue({ stampRate: v });
    } catch {
      setStampRate(0);
      form.setFieldsValue({ stampRate: 0 });
    }
  };

  // Retention selector
  const handleRetentionChange = async (id) => {
    if (!id || id === 'redirectURL') {
      setRetentionRate(0);
      form.setFieldsValue({ retentionRate: 0 });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'retentionsetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setRetentionRate(v);
      form.setFieldsValue({ retentionRate: v });
    } catch {
      setRetentionRate(0);
      form.setFieldsValue({ retentionRate: 0 });
    }
  };

  // Recalculate tax totals whenever base or rates change
  useEffect(() => {
    // compute subTotal from items list
    try {
      const qt = Array.isArray(items)
        ? items.reduce((acc, it) => acc + (parseFloat(it?.total) || (parseFloat(it?.quantity||0) * parseFloat(it?.price||0)) || 0), 0)
        : 0;
      const rounded = calculate.roundUp2(qt);
      setSubTotal(rounded);
      form.setFieldsValue({ netAmount: rounded });
    } catch {}

    const base = Number(subTotal) || 0;
    const vat = calculate.roundUp2(calculate.multiply(base, (Number(vatRate) || 0) / 100));
    const wht = calculate.roundUp2(calculate.multiply(base, (Number(whtRate) || 0) / 100));
    const stamp = calculate.roundUp2(calculate.multiply(base, (Number(stampRate) || 0) / 100));
    const retention = calculate.roundUp2(calculate.multiply(base, (Number(retentionRate) || 0) / 100));
    setVatTotal(vat);
    setWhtTotal(wht);
    setStampTotal(stamp);
    setRetentionTotal(retention);
    const tot = calculate.add(
      calculate.add(
        calculate.add(
          calculate.add(base, vat),
          -wht
        ),
        -stamp
      ),
      -retention
    );
    setGrandTotal(Number.parseFloat(tot) || 0);
    // Sync fields expected by backend
    form.setFieldsValue({ vatAmount: vat, grossAmount: tot });
  }, [items, subTotal, vatRate, whtRate, stampRate, retentionRate]);

  // Add first line automatically for better UX (like AP Customer-Invoice)
  useEffect(() => {
    try { addField.current?.click?.(); } catch {}
  }, []);

  return (
    <div className='invoice-jo-form ap-invoice-compact'>
      {/* References moved to the top */}
      <Typography.Title level={5} className='invoice-jo-section-title'>References</Typography.Title>
      <Row gutter={[12, 6]}>
        <Col xs={24} md={12}>
          <Form.Item name='deliveryId' label={'Reference No'} rules={[{ required: true, message: 'Reference is required' }]}>
            <SelectAsync
              key={`invoicejo-delivery-${currentJO || 'none'}-${refreshKey || 0}`}
              entity={'delivery'}
              outputValue={'_id'}
              displayLabels={['referenceNo']}
              placeholder={'Select Reference (Approved GRN/SC)'}
              size='small'
              listOptions={
                currentJO
                  ? { filter: 'joId', equal: currentJO, inFilter: 'status', inEqual: 'Approved', onlyAvailableForInvoice: 1, items: 50, sortBy: 'referenceNo', sortValue: 1 }
                  : { inFilter: 'status', inEqual: 'Approved', onlyAvailableForInvoice: 1, items: 50, sortBy: 'referenceNo', sortValue: 1 }
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='joId' label={'Job Order'} rules={[{ required: true }]}> 
            <SelectAsync
              entity={'joborder'}
              outputValue={'_id'}
              displayLabels={['joNo']}
              placeholder={'Select Job Order'}
              size='small'
              listOptions={filteredJOId ? { filter: '_id', equal: filteredJOId, onlyApprovedDelivery: 1 } : { onlyApprovedDelivery: 1 }}
              onChange={(id)=>{ setFilteredJOId(undefined); handleJOChange(id); }}
            />
          </Form.Item>
        </Col>
        {/** Hidden: budget line auto-derived from selected Job Order; not shown on form */}
        <Form.Item name='budgetLineId' style={{ display: 'none' }}>
          <Input hidden />
        </Form.Item>
      </Row>

      <Divider className='ap-invoice-divider' />
      <Typography.Title level={5} className='invoice-jo-section-title'>New</Typography.Title>
      <Row gutter={[12, 6]}>
        <Col xs={24} md={6}>
          <Form.Item name='vendorId' label={'Vendor'} rules={[{ required: true }]}>
            <SelectAsync entity={'vendor'} outputValue={'_id'} displayLabels={['name']} placeholder={'Search'} size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name='invoiceNo' label={'Number'} rules={[{ required: true }]}>
            <Input placeholder='INV-JO-0000001' readOnly size='small' />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const y = (() => { try { const d = form.getFieldValue('invoiceDate'); const dt = d?.toDate?.() || d; return (dt? new Date(dt): new Date()).getFullYear(); } catch { return new Date().getFullYear(); } })();
              return (
                <Form.Item label={'Year'}>
                  <Input value={y} readOnly size='small' />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item name='status' label={'Status'} initialValue={'Draft'}>
            <Select size='small' options={[{ value: 'Draft', label: 'Draft' }, { value: 'Posted', label: 'Posted' }, { value: 'Cancelled', label: 'Cancelled' }]} />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item name='invoiceDate' label={'Date'} initialValue={dayjs()}> 
            <DatePicker style={{ width: '100%' }} size='small' />
          </Form.Item>
        </Col>
      </Row>

      {/* Items grid similar to AP Customer-Invoice */}
      <Divider className='ap-invoice-divider' />
      <Row gutter={[8, 6]}>
        <Col className='gutter-row' span={5}><p>Budget Line</p></Col>
        <Col className='gutter-row' span={7}><p>Description</p></Col>
        <Col className='gutter-row' span={3}><p>Quantity</p></Col>
        <Col className='gutter-row' span={4}><p>Price</p></Col>
        <Col className='gutter-row' span={5}><p>Total</p></Col>
      </Row>
      <Form.List name='items'>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow
                key={field.key}
                remove={remove}
                field={field}
                requiredMessage='Budget line required'
                placeholder='Select Budget Line'
                selectEntity='budgetline'
                selectOutputValue={'_id'}
                selectDisplayLabels={['glAccount']}
                selectListOptions={deptId ? { filter: 'departmentId', equal: deptId } : {}}
                required={false}
              />
            ))}
            <Form.Item>
              <Button size='small' type='dashed' onClick={() => add()} block ref={addField}>
                + Add Field
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider className='ap-invoice-divider' />
      {/* Hidden fields to persist computed amounts */}
      <Form.Item name='netAmount' style={{ display: 'none' }}><Input hidden /></Form.Item>
      <Form.Item name='vatAmount' style={{ display: 'none' }}><Input hidden /></Form.Item>
      <Form.Item name='grossAmount' style={{ display: 'none' }}><Input hidden /></Form.Item>
      <Form.Item name='retentionRate' style={{ display: 'none' }}><Input hidden /></Form.Item>

      {/* Totals section similar to AP Customer-Invoice */}
      <Divider dashed className='ap-invoice-divider' />
      <div className='invoice-jo-totals'>
        {/* Use offset to push to right, keeping selects and amounts together */}
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}>Sub Total:</Col>
          <Col span={5}>
            <MoneyInputFormItem readOnly value={Number(subTotal) || 0} size='small' />
          </Col>
        </Row>
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}>Stamp Duty:</Col>
          <Col span={5} style={{ paddingRight: 0 }}>
            <Form.Item name='stampId'>
              <SelectAsync
                onChange={handleStampChange}
                entity={'stampdutysetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect={'/stamp-duty-setup'}
                redirectLabel={'Add New Stamp Duty'}
                placeholder={'Select Stamp Duty Value'}
                size='small'
              />
            </Form.Item>
            <Form.Item name='stampRate' style={{ display: 'none' }}><Input hidden /></Form.Item>
          </Col>
          <Col span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={stampTotal} size='small' />
          </Col>
        </Row>
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}>VAT:</Col>
          <Col span={5} style={{ paddingRight: 0 }}>
            <Form.Item name='taxId'>
              <SelectAsync
                onChange={handleVatChange}
                entity={'vatsetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect={'/vat-setup'}
                redirectLabel={'Add New VAT'}
                placeholder={'Select VAT Value'}
                listOptions={{ filter: 'enabled', equal: true }}
                size='small'
              />
            </Form.Item>
            <Form.Item name='taxRate' style={{ display: 'none' }}><Input hidden /></Form.Item>
          </Col>
          <Col span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={vatTotal} size='small' />
          </Col>
        </Row>
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}>Retention:</Col>
          <Col span={5} style={{ paddingRight: 0 }}>
            <Form.Item name='retentionId'>
              <SelectAsync
                onChange={handleRetentionChange}
                entity={'retentionsetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect={'/retention-setup'}
                redirectLabel={'Add New Retention'}
                placeholder={'Select Retention Value'}
                listOptions={{ filter: 'enabled', equal: true }}
                size='small'
              />
            </Form.Item>
          </Col>
          <Col span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={retentionTotal} size='small' />
          </Col>
        </Row>
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}>WHT:</Col>
          <Col span={5} style={{ paddingRight: 0 }}>
            <Form.Item name='whtId'>
              <SelectAsync
                onChange={handleWhtChange}
                entity={'taxes'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect={'/wht-setup'}
                redirectLabel={'Add New WHT'}
                placeholder={'Select WHT Value'}
                size='small'
              />
            </Form.Item>
            <Form.Item name='whtRate' style={{ display: 'none' }}><Input hidden /></Form.Item>
          </Col>
          <Col span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={whtTotal} size='small' />
          </Col>
        </Row>
        <Row gutter={[8, 4]} align='middle'>
          <Col span={4} offset={10} style={{ textAlign: 'right', paddingTop: 6 }}><b>Total:</b></Col>
          <Col span={5}>
            <MoneyInputFormItem readOnly value={grandTotal} size='small' />
          </Col>
        </Row>
      </div>
    </div>
  );
}
