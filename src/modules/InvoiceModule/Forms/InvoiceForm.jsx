import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Row, Col } from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';

import ItemRow from '@/modules/ErpPanelModule/ItemRow';

import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { formatVoucherNumber } from '@/utils/helpers';

export default function InvoiceForm({ subTotal = 0, current = null, onViewLast, lastCreatedId }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return <></>;
  }

  return (
    <LoadInvoiceForm
      subTotal={subTotal}
      current={current}
      onViewLast={onViewLast}
      lastCreatedId={lastCreatedId}
    />
  );
}

function LoadInvoiceForm({ subTotal = 0, current = null, onViewLast, lastCreatedId }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const isEditing = Boolean(current);

  useEffect(() => {
    if (!isEditing) {
      setLastNumber(last_invoice_number + 1);
    }
  }, [last_invoice_number, isEditing]);

  const handelTaxChange = (value) => {
    setTaxRate(value / 100);
  };

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    }
  }, [current]);
  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  const addField = useRef(false);

  useEffect(() => {
    addField.current.click();
  }, []);

  const numberFormatter = (value) => formatVoucherNumber(value || 0);
  const numberParser = (value) => {
    if (!value) return 0;
    const digits = value.toString().replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const sectionStyle = {
    background: '#fbfcfe',
    border: '1px solid #eef2f7',
    padding: 16,
    borderRadius: 10,
  };
  const lineHeaderStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#5c6b77',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  };
  const labelStyle = { fontSize: 12, color: '#5c6b77', marginBottom: 4 };

  return (
    <>
      <div style={sectionStyle}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Client'}
              withRedirect
              urlToRedirect={'/customer'}
              size="small"
            />
          </Form.Item>
          </Col>
          <Col xs={12} md={5}>
          <Form.Item
            key={`invoice-number-${lastNumber}`}
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            tooltip={!isEditing ? translate('Auto-generated') || 'Auto-generated' : undefined}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              controls={isEditing}
              readOnly={!isEditing}
              formatter={numberFormatter}
              parser={numberParser}
              size="small"
            />
          </Form.Item>
          </Col>
          <Col xs={12} md={3}>
          <Form.Item
            label={translate('year')}
            name="year"
            initialValue={currentYear}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={2000} style={{ width: '100%' }} size="small" />
          </Form.Item>
          </Col>

          <Col xs={12} md={6}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[
              {
                required: false,
              },
            ]}
            initialValue={'draft'}
          >
            <Select
              size="small"
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
              ]}
            ></Select>
          </Form.Item>
          </Col>

          <Col xs={12} md={6}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} size="small" />
          </Form.Item>
          </Col>
          <Col xs={12} md={6}>
          <Form.Item
            name="expiredDate"
            label={translate('Expire Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} size="small" />
          </Form.Item>
          </Col>
          <Col xs={24} md={12}>
          <Form.Item
            label={translate('Note')}
            name="notes"
            rules={[
              { required: true },
              { whitespace: true },
            ]}
          >
            <Input size="small" placeholder={translate('Please enter a note')} />
          </Form.Item>
          </Col>
        </Row>
      </div>

      <div style={{ ...sectionStyle, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{translate('Items') || 'Items'}</div>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #eef2f7',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Row gutter={[8, 6]} style={{ marginBottom: 6 }}>
            <Col span={5} style={lineHeaderStyle}>
              {translate('Posting Code') || 'Posting Code'}
            </Col>
            <Col span={7} style={lineHeaderStyle}>
              {translate('Description')}
            </Col>
            <Col span={3} style={lineHeaderStyle}>
              {translate('Quantity')}
            </Col>
            <Col span={4} style={lineHeaderStyle}>
              {translate('Price')}
            </Col>
            <Col span={5} style={lineHeaderStyle}>
              {translate('Total')}
            </Col>
          </Row>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <ItemRow key={field.key} remove={remove} field={field} current={current}></ItemRow>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    ref={addField}
                  >
                    {translate('Add field')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>

        <Row gutter={[12, 12]} align="middle" style={{ marginTop: 12 }}>
          <Col xs={24} md={8}>
            <Row gutter={[8, 8]}>
              <Col xs={12}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button size="small" type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                    {translate('Save')}
                  </Button>
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    size="small"
                    block
                    onClick={() => {
                      if (onViewLast) {
                        onViewLast();
                      }
                    }}
                  >
                    {translate('View Voucher') || 'View Voucher'}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col xs={12} md={6}>
                <div style={labelStyle}>{translate('Sub Total')}</div>
                <MoneyInputFormItem readOnly value={subTotal} size="small" />
              </Col>
              <Col xs={12} md={6}>
                <div style={labelStyle}>{translate('Tax')}</div>
                <Form.Item
                  name="taxRate"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <SelectAsync
                    size="small"
                    value={taxRate}
                    onChange={handelTaxChange}
                    entity={'taxes'}
                    outputValue={'taxValue'}
                    displayLabels={['taxName']}
                    withRedirect={true}
                    urlToRedirect="/wht-setup"
                    redirectLabel={translate('add_new_wht') || 'Add New WHT'}
                    placeholder={translate('Select Tax Value')}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <div style={labelStyle}>{translate('Tax Total')}</div>
                <MoneyInputFormItem readOnly value={taxTotal} size="small" />
              </Col>
              <Col xs={12} md={6}>
                <div style={labelStyle}>{translate('Total')}</div>
                <MoneyInputFormItem readOnly value={total} size="small" />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
}
