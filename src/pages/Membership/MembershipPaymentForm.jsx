import React from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Switch, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import './MembershipPaymentForm.css';

const formatAmount = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseAmount = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const cleaned = value.toString().replace(/,/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? '' : num;
};

const buildDefaultReferenceNumber = () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const hms = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}${String(now.getSeconds()).padStart(2, '0')}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `MP-${ymd}-${hms}${rand}`;
};

export default function MembershipPaymentForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const currentId = Form.useWatch('_id', form);
  const currentRef = Form.useWatch('referenceNumber', form);
  const watchedCategory = Form.useWatch('category', form);
  const currentDoc = Form.useWatch('tellerDocument', form);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState('');
  const isLocalRuntime =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || '');
  const defaultBackend =
    typeof window !== 'undefined'
      ? isLocalRuntime
        ? 'http://localhost:8888'
        : window.location.origin
      : 'http://localhost:8888';
  const rawBackend = (import.meta.env.VITE_BACKEND_SERVER || defaultBackend)
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  const backendRoot = /\/api$/i.test(rawBackend) ? rawBackend.replace(/\/api$/i, '') : rawBackend;
  const toDocumentUrl = (filePath) => {
    const src = (filePath || '').toString().trim();
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    return `${backendRoot}/${src.replace(/^\/+/, '')}`;
  };

  const toId = React.useCallback((value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return (value._id || value.value || value.id || '').toString().trim();
    }
    return value.toString().trim();
  }, []);

  React.useEffect(() => {
    const currentCategoryId = toId(watchedCategory);
    setSelectedCategoryId(currentCategoryId);
  }, [watchedCategory, toId]);

  const handleCategoryChange = (categoryId) => {
    const id = (categoryId || '').toString().trim();
    setSelectedCategoryId(id);
    form.setFieldsValue({ categoryType: undefined, amount: undefined, description: undefined });
    if (!id) {
      return;
    }
  };

  const handleCategorySelect = (record) => {
    const id = (record?._id || '').toString().trim();
    if (!id) return;
    setSelectedCategoryId(id);
    form.setFieldsValue({
      category: id,
      categoryType: undefined,
      amount: undefined,
      description: undefined,
    });
  };

  const handleCategoryTypeSelect = (record) => {
    const categoryTypeLabel = (record?.categoryType || '').toString().trim();
    const nextDescription = categoryTypeLabel
      ? `Being payment for ${categoryTypeLabel}`
      : 'Being payment for';
    const configuredAmount = Number(record?.amount || 0);
    if (Number.isFinite(configuredAmount)) {
      form.setFieldsValue({ amount: configuredAmount, description: nextDescription });
      return;
    }
    form.setFieldsValue({ amount: undefined, description: nextDescription });
  };

  React.useEffect(() => {
    // Only auto-fill reference number for create mode, with no API call.
    if (currentId) return;
    if ((currentRef || '').toString().trim()) return;
    form.setFieldsValue({ referenceNumber: buildDefaultReferenceNumber() });
  }, [currentId, currentRef, form]);

  return (
    <div className="compactForm membership-payment-compact">
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Reference Number') || 'Reference Number'}
            name="referenceNumber"
            rules={[
              {
                required: true,
                message: 'Reference Number is required',
              },
            ]}
          >
            <Input
              size="small"
              readOnly
              placeholder={translate('Auto generated on submit') || 'Auto generated on submit'}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('MemberID') || 'MemberID'}
            name="name"
            rules={[{ required: true, message: 'Please enter MemberID' }]}
          >
            <Input size="small" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Category') || 'Category'}
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <SelectAsync
              entity={'membershipcategory'}
              outputValue={'_id'}
              displayLabels={['name']}
              placeholder={translate('Select Category') || 'Select Category'}
              onChange={handleCategoryChange}
              onSelectRecord={handleCategorySelect}
              size="small"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Category Type') || 'Category Type'}
            name="categoryType"
            rules={[{ required: true, message: 'Please select category type' }]}
          >
            <SelectAsync
              key={`membership-payment-category-type-${selectedCategoryId || 'none'}`}
              entity={'membershipcategorytype'}
              outputValue={'_id'}
              displayLabels={['categoryType']}
              placeholder={translate('Select Category Type') || 'Select Category Type'}
              listOptions={{
                filter: 'category',
                equal: selectedCategoryId || '__none__',
                items: 100,
                sortBy: 'categoryType',
                sortValue: 1,
              }}
              skipFetch={!selectedCategoryId}
              disabled={!selectedCategoryId}
              onChange={(value) => {
                if (!value) form.setFieldsValue({ amount: undefined, description: undefined });
              }}
              onSelectRecord={handleCategoryTypeSelect}
              size="small"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Bank') || 'Bank'}
            name="bank"
            rules={[{ required: true, message: 'Please select bank' }]}
          >
            <SelectAsync
              entity={'bank'}
              outputValue={'_id'}
              displayLabels={['name', 'accountNumber']}
              placeholder={translate('Select Bank') || 'Select Bank'}
              size="small"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Pay Date') || 'Pay Date'}
            name="payDate"
            rules={[{ required: true, message: 'Please select pay date' }]}
          >
            <Input type="date" size="small" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Amount') || 'Amount'}
            name="amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              formatter={formatAmount}
              parser={parseAmount}
              controls={false}
              keyboard={false}
              disabled
              size="small"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Teller Number') || 'Teller Number'}
            name="tellerNumber"
            normalize={(v) => (v || '').toString().toUpperCase()}
          >
            <Input
              size="small"
              placeholder={translate('Enter Teller Number') || 'Enter Teller Number'}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Active') || 'Active'}
            name="active"
            valuePropName="checked"
            initialValue={true}
            className="membership-payment-active-item"
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={translate('Teller Document') || 'Teller Document'}
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const hasUpload = Array.isArray(value) && value.length > 0;
                  const hasExisting = !!(getFieldValue('tellerDocument') || '').toString().trim();
                  if (hasUpload || hasExisting) return Promise.resolve();
                  return Promise.reject(new Error('Please upload teller document'));
                },
              }),
            ]}
          >
            <Upload
              className="membership-payment-upload"
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            >
              <Button icon={<UploadOutlined />} size="small">
                {translate('Click to Upload') || 'Click to Upload'}
              </Button>
            </Upload>
          </Form.Item>
          {currentDoc ? (
            <div style={{ marginTop: -6, marginBottom: 8 }}>
              <Button
                type="link"
                size="small"
                style={{ paddingLeft: 0 }}
                onClick={() => window.open(toDocumentUrl(currentDoc), '_blank', 'noopener,noreferrer')}
              >
                {translate('View Saved Document') || 'View Saved Document'}
              </Button>
            </div>
          ) : null}
        </Col>

        <Col xs={24}>
          <Form.Item
            label={translate('Description') || 'Description'}
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} size="small" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="tellerDocument" hidden>
        <Input />
      </Form.Item>
    </div>
  );
}
