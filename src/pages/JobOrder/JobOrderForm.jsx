import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Row, Col, Divider, Typography, Button } from 'antd';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import calculate from '@/utils/calculate';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import './JobOrderForm.css';

export default function JobOrderForm({ subTotal: subTotalFromParent } = {}) {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const [prDeptId, setPrDeptId] = useState();

  useEffect(()=>{},[]);

  // Live watchers for calculations
  const unitPriceWatch = Form.useWatch('unitPrice', form);
  const qtyWatch = Form.useWatch('qty', form);
  const vatRateWatch = Form.useWatch('vatRate', form);
  const retentionRateWatch = Form.useWatch('retentionRate', form);
  const whtRateWatch = Form.useWatch('whtRate', form);
  const stampRateWatch = Form.useWatch('stampDutyRate', form);

  const u = Number(unitPriceWatch) || 0;
  const q = Number(qtyWatch) || 0;
  const subTotalComputed = (typeof subTotalFromParent === 'number')
    ? Number(subTotalFromParent || 0)
    : calculate.roundUp2(calculate.multiply(u, q));
  const vRate = (Number(vatRateWatch) || 0) / 100;
  const rRate = (Number(retentionRateWatch) || 0) / 100;
  const wRate = (Number(whtRateWatch) || 0) / 100;
  const sRate = (Number(stampRateWatch) || 0) / 100;
  const vatAmt = calculate.roundUp2(calculate.multiply(subTotalComputed, vRate));
  const retentionAmt = calculate.roundUp2(calculate.multiply(subTotalComputed, rRate));
  const whtAmt = calculate.roundUp2(calculate.multiply(subTotalComputed, wRate));
  const stampAmt = calculate.roundUp2(calculate.multiply(subTotalComputed, sRate));
  const totalAmt = calculate.roundUp2(
    calculate.add(
      calculate.add(
        calculate.add(
          calculate.add(subTotalComputed, vatAmt),
          -whtAmt
        ),
        -stampAmt
      ),
      -retentionAmt
    )
  );

  // Handlers to pull rates from setup collections and set percent values on hidden fields
  const handleVatChange = async (id) => {
    try {
      if (!id || id === 'redirectURL') { form.setFieldsValue({ vatRate: undefined, vatId: undefined }); return; }
      const { success, result } = await request.read({ entity: 'vatsetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      form.setFieldsValue({ vatRate: v, vatId: id });
    } catch {
      form.setFieldsValue({ vatRate: undefined, vatId: undefined });
    }
  };

  const handleRetentionChange = async (id) => {
    try {
      if (!id || id === 'redirectURL') { form.setFieldsValue({ retentionRate: undefined, retentionId: undefined }); return; }
      const { success, result } = await request.read({ entity: 'retentionsetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      form.setFieldsValue({ retentionRate: v, retentionId: id });
    } catch {
      form.setFieldsValue({ retentionRate: undefined, retentionId: undefined });
    }
  };

  const handleWhtChange = async (id) => {
    try {
      if (!id || id === 'redirectURL') { form.setFieldsValue({ whtRate: undefined, whtId: undefined }); return; }
      const { success, result } = await request.read({ entity: 'taxes', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      form.setFieldsValue({ whtRate: v, whtId: id });
    } catch {
      form.setFieldsValue({ whtRate: undefined, whtId: undefined });
    }
  };

  const handleStampChange = async (id) => {
    try {
      if (!id || id === 'redirectURL') { form.setFieldsValue({ stampDutyRate: undefined, stampId: undefined }); return; }
      const { success, result } = await request.read({ entity: 'stampdutysetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      form.setFieldsValue({ stampDutyRate: v, stampId: id });
    } catch {
      form.setFieldsValue({ stampDutyRate: undefined, stampId: undefined });
    }
  };

  const handleVendorChange = async (vendorId) => {
    try {
      if (!vendorId) { form.setFieldsValue({ vendorTin: undefined }); return; }
      const { success, result } = await request.read({ entity: 'vendor', id: vendorId });
      if (success && result) form.setFieldsValue({ vendorTin: result?.tin || '' });
    } catch {}
  };

  const handlePRChange = async (reqId) => {
    try {
      if (!reqId) { setPrDeptId(undefined); return; }
      const { success, result } = await request.read({ entity: 'requisition', id: reqId });
      if (success && result) setPrDeptId(result?.department?._id || result?.department);
    } catch {}
  };

  return (
    <>
      <div className='jo-compact'>
      <Typography.Title level={5} style={{ marginTop: 0 }}>References</Typography.Title>
      {(() => {
        const isItemsMode = typeof subTotalFromParent === 'number';
        if (isItemsMode) {
          return (
            <Row gutter={[6, 4]}>
            <Col xs={24} md={8}>
              <Form.Item name='prId' label={translate('Link to PR') || 'Link to PR'} rules={[{ required: true }]}>
                <SelectAsync
                  size='small'
                  entity={'requisition'}
                  outputValue={'_id'}
                  displayLabels={['prNo']}
                  placeholder={translate('Select PR') || 'Select PR'}
                  onChange={handlePRChange}
                  listOptions={{ filter: 'status', equal: 'Approved' }}
                />
              </Form.Item>
            </Col>
              <Col xs={24} md={8}>
                <Form.Item name='startDate' label={translate('Start date')}>
                  <DatePicker size='small' style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name='dueDate' label={translate('Due date')}>
                  <DatePicker size='small' style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          );
        }
        return (
          <Row gutter={[6, 4]}>
            <Col xs={24} md={12}>
              <Form.Item name='prId' label={translate('Link to PR') || 'Link to PR'} rules={[{ required: true }]}>
                <SelectAsync
                  size='small'
                  entity={'requisition'}
                  outputValue={'_id'}
                  displayLabels={['prNo']}
                  placeholder={translate('Select PR') || 'Select PR'}
                  onChange={handlePRChange}
                  listOptions={{ filter: 'status', equal: 'Approved' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='budgetLineId' label={'Budget Line'} rules={[{ required: true, message: 'Budget Line is required' }]}> 
                <SelectAsync size='small'
                  key={`budgetline-${prDeptId || 'all'}`}
                  entity={'budgetline'}
                  outputValue={'_id'}
                  displayLabels={['glAccount']}
                  placeholder={'Select Budget Line'}
                  listOptions={prDeptId ? { filter: 'departmentId', equal: prDeptId } : {}}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      })()}

      <Divider style={{ margin: '6px 0 8px' }} />
      <Typography.Title level={5}>Vendor</Typography.Title>
      <Row gutter={[6, 4]} align='top'>
        <Col xs={24} md={12}>
          <Row gutter={[6, 4]}>
            <Col xs={24} md={12}>
              <Form.Item name='vendorId' label={translate('Vendor')} rules={[{ required: true }]}> 
                <SelectAsync size='small' entity={'vendor'} outputValue={'_id'} displayLabels={['name']} placeholder={translate('Select Vendor')} onChange={handleVendorChange} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='vendorTin' label={'TIN'}>
                <Input size='small' readOnly disabled />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='scope' label={translate('Scope/SoW') || 'Scope/SoW'} rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      {typeof subTotalFromParent !== 'number' && (
        <>
          <p className='jo-mini-title'>Schedule</p>
          <Row gutter={[6, 4]}>
            <Col xs={24} md={12}>
              <Form.Item name='startDate' label={translate('Start date')}>
                <DatePicker size='small' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='dueDate' label={translate('Due date')}>
                <DatePicker size='small' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {/* Amounts for Drawer (single-line) OR Items table for Create page */}
      {typeof subTotalFromParent === 'number' ? (
        <>
          <Divider dashed style={{ margin: '6px 0 8px' }} />
          <Row gutter={[6, 0]}>
            <Col className='gutter-row' span={5}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0 }}>{'Budget Line'}</p>
            </Col>
            <Col className='gutter-row' span={7}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0 }}>{translate('Description') || 'Description'}</p>
            </Col>
            <Col className='gutter-row' span={3}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0 }}>{translate('Quantity') || 'Quantity'}</p>
            </Col>
            <Col className='gutter-row' span={4}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0 }}>{translate('Unit Price') || 'Unit Price'}</p>
            </Col>
            <Col className='gutter-row' span={5}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0 }}>{translate('Total') || 'Total'}</p>
            </Col>
          </Row>
          <Form.List name='items'>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <ItemRow
                    key={field.key}
                    remove={remove}
                    field={field}
                    requiredMessage='Budget Line required'
                    placeholder='Select Budget Line'
                    selectEntity='budgetline'
                    selectOutputValue='_id'
                    selectDisplayLabels={['glAccount']}
                    selectListOptions={prDeptId ? { filter: 'departmentId', equal: prDeptId } : undefined}
                  />
                ))}
                <Form.Item>
                  <Button size='small' type='dashed' onClick={() => add()} block>
                    {translate('Add field')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </>
      ) : (
        <>
          <Divider style={{ margin: '6px 0 8px' }} />
          <Typography.Title level={5}>Amounts</Typography.Title>
          <Row gutter={[6, 4]}>
            <Col xs={24} md={12}>
              <Form.Item name='unitPrice' label={translate('Unit Price')} rules={[{ required: true }]}>
                <InputNumber size='small' style={{ width: '100%' }} min={0} step={0.01} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name='qty' label={translate('Quantity')} rules={[{ required: true }]}>
                <InputNumber size='small' style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Divider style={{ margin: '6px 0 8px' }} />
      <Row gutter={[12, 0]} align='top'>
        <Col xs={24} md={16}>
          <Typography.Title level={5}>Rates</Typography.Title>
          <div className='jo-rates'>
        {/* VAT row */}
        <Row gutter={[6, 0]} align='middle'>
          <Col xs={8}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>{translate('VAT (%)')}:</p>
          </Col>
          <Col xs={8} style={{ paddingRight: 0 }}>
            <Form.Item name='vatId'>
              <SelectAsync
                size='small'
                entity={'vatsetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                listOptions={{ filter: 'enabled', equal: true }}
                placeholder={translate('Select VAT Value')}
                withRedirect={true}
                urlToRedirect={'/vat-setup'}
                redirectLabel={translate('Add New VAT') || 'Add New VAT'}
                onChange={handleVatChange}
              />
            </Form.Item>
            <Form.Item name='vatRate' style={{ display: 'none' }} initialValue={7.5}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col xs={8} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={vatAmt} size='small' />
          </Col>
        </Row>
        {/* Retention row */}
        <Row gutter={[6, 0]} align='middle'>
          <Col xs={8}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>{translate('Retention (%)')}:</p>
          </Col>
          <Col xs={8} style={{ paddingRight: 0 }}>
            <Form.Item name='retentionId'>
              <SelectAsync
                size='small'
                entity={'retentionsetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                listOptions={{ filter: 'enabled', equal: true }}
                placeholder={'Select Retention Value'}
                withRedirect={true}
                urlToRedirect={'/retention-setup'}
                redirectLabel={'Add New Retention'}
                onChange={handleRetentionChange}
              />
            </Form.Item>
            <Form.Item name='retentionRate' style={{ display: 'none' }} initialValue={0}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col xs={8} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={retentionAmt} size='small' />
          </Col>
        </Row>
        {/* WHT row */}
        <Row gutter={[6, 0]} align='middle'>
          <Col xs={8}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>WHT (%):</p>
          </Col>
          <Col xs={8} style={{ paddingRight: 0 }}>
            <Form.Item name='whtId'>
              <SelectAsync
                size='small'
                entity={'taxes'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                placeholder={'Select WHT Value'}
                withRedirect={true}
                urlToRedirect={'/wht-setup'}
                redirectLabel={translate('add_new_wht') || 'Add New WHT'}
                onChange={handleWhtChange}
              />
            </Form.Item>
            <Form.Item name='whtRate' style={{ display: 'none' }} initialValue={0}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col xs={8} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={whtAmt} size='small' />
          </Col>
        </Row>
        {/* Stamp Duty row */}
        <Row gutter={[6, 0]} align='middle'>
          <Col xs={8}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>Stamp Duty (%):</p>
          </Col>
          <Col xs={8} style={{ paddingRight: 0 }}>
            <Form.Item name='stampId'>
              <SelectAsync
                size='small'
                entity={'stampdutysetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                placeholder={'Select Stamp Duty Value'}
                withRedirect={true}
                urlToRedirect={'/stamp-duty-setup'}
                redirectLabel={'Add New Stamp Duty'}
                onChange={handleStampChange}
              />
            </Form.Item>
            <Form.Item name='stampDutyRate' style={{ display: 'none' }} initialValue={0}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col xs={8} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={stampAmt} size='small' />
          </Col>
        </Row>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <Typography.Title level={5}>Summary</Typography.Title>
          <Row gutter={[6, 0]} align='middle'>
            <Col xs={12}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>{translate('Sub Total') || 'Sub Total'}:</p>
            </Col>
            <Col xs={12}>
              <MoneyInputFormItem readOnly value={subTotalComputed} size='small' />
            </Col>
          </Row>
          <Row gutter={[6, 0]} align='middle'>
            <Col xs={12}>
              <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>Total Amount :</p>
            </Col>
            <Col xs={12}>
              <MoneyInputFormItem readOnly value={totalAmt} size='small' />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
    </>
  );
}
