import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import './APCustomerInvoiceForm.css';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

export default function APCustomerInvoiceForm({ subTotal = 0, current = null }) {
  return <LoadAPCustomerInvoiceForm subTotal={subTotal} current={current} />;
}

function LoadAPCustomerInvoiceForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // VAT %
  const [taxTotal, setTaxTotal] = useState(0); // VAT amount
  const [whtRate, setWhtRate] = useState(0); // WHT %
  const [whtTotal, setWhtTotal] = useState(0); // WHT amount
  const [stampRate, setStampRate] = useState(0); // Stamp Duty %
  const [stampTotal, setStampTotal] = useState(0); // Stamp Duty amount
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(1);
  const isEditing = Boolean(current);

  // Next number
  useEffect(() => {
    (async () => {
      if (isEditing) return;
      try {
        const { success, result } = await request.get({ entity: 'apcustomerinvoice/next-number' });
        if (success && result) {
          if (typeof result.number === 'number') setLastNumber(result.number);
          if (typeof result.year === 'number') setCurrentYear(result.year);
        }
      } catch {}
    })();
  }, [isEditing]);

  const form = Form.useFormInstance();
  // VAT from VAT-Setup
  const handelTaxChange = async (id) => {
    // Clear selected VAT -> reset rate and id
    if (!id || id === 'redirectURL') {
      setTaxRate(0);
      setTaxTotal(0);
      form.setFieldsValue({ taxRate: 0, taxId: undefined });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'vatsetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setTaxRate((v || 0) / 100);
      form.setFieldsValue({ taxRate: v, taxId: id });
    } catch {
      setTaxRate(0);
      setTaxTotal(0);
      form.setFieldsValue({ taxRate: 0, taxId: undefined });
    }
  };
  // WHT from Taxes
  const handleWhtChange = async (id) => {
    // Clear selected WHT -> reset
    if (!id || id === 'redirectURL') {
      setWhtRate(0);
      setWhtTotal(0);
      form.setFieldsValue({ whtRate: 0, whtId: undefined });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'taxes', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setWhtRate((v || 0) / 100);
      form.setFieldsValue({ whtRate: v, whtId: id });
    } catch {
      setWhtRate(0);
      setWhtTotal(0);
      form.setFieldsValue({ whtRate: 0, whtId: undefined });
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (!current) return;
    const { taxRate: tr = 0, whtRate: wr = 0, stampRate: sr = 0, year, number } = current;
    setTaxRate((Number(tr) || 0) / 100);
    setWhtRate((Number(wr) || 0) / 100);
    setStampRate((Number(sr) || 0) / 100);
    if (year) setCurrentYear(year);
    if (number) setLastNumber(number);
  }, [current]);

  // Recalculate totals
  useEffect(() => {
    const vat = calculate.roundUp2(calculate.multiply(subTotal, taxRate)) || 0;
    const wht = calculate.roundUp2(calculate.multiply(subTotal, whtRate)) || 0;
    const stamp = calculate.roundUp2(calculate.multiply(subTotal, stampRate)) || 0;
    setTaxTotal(vat);
    setWhtTotal(wht);
    setStampTotal(stamp);
    const t = calculate.add(calculate.add(calculate.add(subTotal || 0, vat), -wht), -stamp);
    setTotal(Number.parseFloat(t) || 0);
  }, [subTotal, taxRate, whtRate, stampRate]);

  // Add first row by default
  const addField = useRef(false);
  useEffect(() => {
    try { addField.current?.click?.(); } catch {}
  }, []);

  const numberFormatter = (value) => `INV-${(Number(value) || 0).toString().padStart(6, '0')}`;
  const numberParser = (value) => {
    if (!value) return 0;
    const digits = value.toString().replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };
  // Stamp Duty from StampDuty Setup
  const handleStampChange = async (id) => {
    // Clear selected Stamp -> reset
    if (!id || id === 'redirectURL') {
      setStampRate(0);
      setStampTotal(0);
      form.setFieldsValue({ stampRate: 0, stampId: undefined });
      return;
    }
    try {
      const { success, result } = await request.read({ entity: 'stampdutysetup', id });
      const v = success ? Number(result?.taxValue || 0) : 0;
      setStampRate((v || 0) / 100);
      form.setFieldsValue({ stampRate: v, stampId: id });
    } catch {
      setStampRate(0);
      setStampTotal(0);
      form.setFieldsValue({ stampRate: 0, stampId: undefined });
    }
  };

  return (
    <>
      <Row gutter={[8, 8]} className="ap-invoice-compact">
        <Col className="gutter-row" span={8}>
          <Form.Item name="client" label={translate('Client')} rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <AutoCompleteAsync entity={'client'} displayLabels={['name']} searchFields={'name'} withRedirect redirectLabel={'Add New Client'} urlToRedirect={'/customer'} size="small" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item
            key={`ap-invoice-number-${lastNumber}`}
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            tooltip={(translate('Auto-generated') || 'Auto-generated')}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              controls={false}
              readOnly
              formatter={numberFormatter}
              parser={numberParser}
              size="small"
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item label={translate('year')} name="year" initialValue={currentYear} rules={[{ required: true }]}>
            <InputNumber min={2000} style={{ width: '100%' }} size="small" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item label={translate('status')} name="status" initialValue={'draft'}>
            <Select size="small" options={[{ value: 'draft', label: translate('Draft') }, { value: 'pending', label: translate('Pending') }, { value: 'sent', label: translate('Sent') }]} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={8}>
          <Form.Item name="date" label={translate('Date')} rules={[{ required: true, type: 'object' }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} format={dateFormat} size="small" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item name="expiredDate" label={translate('Expire Date')} rules={[{ required: true, type: 'object' }]} initialValue={dayjs().add(30, 'days')}>
            <DatePicker style={{ width: '100%' }} format={dateFormat} size="small" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={10}>
          <Form.Item label={translate('Note')} name="notes" rules={[{ required: true }, { whitespace: true }]}>
            <Input placeholder={translate('Please enter a note')} size="small" />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed className="ap-invoice-divider" />
      <Row gutter={[8, 8]} style={{ position: 'relative' }} className="ap-invoice-compact">
        <Col className="gutter-row" span={5}><p>{translate('Posting Code') || 'Posting Code'}</p></Col>
        <Col className="gutter-row" span={7}><p>{translate('Description')}</p></Col>
        <Col className="gutter-row" span={3}><p>{translate('Quantity')}</p></Col>
        <Col className="gutter-row" span={4}><p>{translate('Price')}</p></Col>
        <Col className="gutter-row" span={5}><p>{translate('Total')}</p></Col>
      </Row>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow key={field.key} remove={remove} field={field} current={current}></ItemRow>
            ))}
            <Form.Item>
              <Button size="small" type="dashed" onClick={() => add()} block icon={<PlusOutlined />} ref={addField}>
                {translate('Add field')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Divider dashed className="ap-invoice-divider" />
      <div style={{ position: 'relative', width: '100%', float: 'right' }} className="ap-invoice-compact">
        <Row gutter={[8, 0]}>
          <Col className="gutter-row" span={5}>
            <Form.Item>
              <Button size="small" type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                {translate('Save')}
              </Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>{translate('Sub Total')}:</p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} size="small" />
          </Col>
        </Row>
        {/* Stamp Duty row */}
        <Row gutter={[8, 0]}>
          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>Stamp Duty:</p>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingRight: 0 }}>
            <Form.Item name="stampId">
              <SelectAsync
                onChange={handleStampChange}
                entity={'stampdutysetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/stamp-duty-setup"
                redirectLabel={'Add New Stamp Duty'}
                placeholder={'Select Stamp Duty Value'}
                size="small"
              />
            </Form.Item>
            <Form.Item name="stampRate" style={{ display: 'none' }}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={stampTotal} size="small" />
          </Col>
        </Row>
        <Row gutter={[8, 0]}>
          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>VAT:</p>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingRight: 0 }}>
            <Form.Item name="taxId">
              <SelectAsync
                onChange={handelTaxChange}
                entity={'vatsetup'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/vat-setup"
                redirectLabel={translate('Add New VAT') || 'Add New VAT'}
                placeholder={translate('Select VAT Value')}
                listOptions={{ filter: 'enabled', equal: true }}
                size="small"
              />
            </Form.Item>
            <Form.Item name="taxRate" style={{ display: 'none' }}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={taxTotal} size="small" />
          </Col>
        </Row>
        {/* WHT row */}
        <Row gutter={[8, 0]}>
          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>WHT:</p>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingRight: 0 }}>
            <Form.Item name="whtId">
              <SelectAsync
                onChange={handleWhtChange}
                entity={'taxes'}
                outputValue={'_id'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/wht-setup"
                redirectLabel={translate('add_new_wht') || 'Add New WHT'}
                placeholder={'Select WHT Value'}
                size="small"
              />
            </Form.Item>
            <Form.Item name="whtRate" style={{ display: 'none' }}>
              <Input hidden />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5} style={{ paddingLeft: 0 }}>
            <MoneyInputFormItem readOnly value={whtTotal} size="small" />
          </Col>
        </Row>
        <Row gutter={[8, 0]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right' }}>{translate('Total')}:</p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} size="small" />
          </Col>
        </Row>
      </div>
    </>
  );
}

