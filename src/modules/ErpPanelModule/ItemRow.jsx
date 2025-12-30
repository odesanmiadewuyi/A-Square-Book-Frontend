import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import SelectAsync from '@/components/SelectAsync';
import useLanguage from '@/locale/useLanguage';

export default function ItemRow({
  field,
  remove,
  current = null,
  // Optional overrides for first column select and labels
  requiredMessage = 'Posting code required',
  placeholder = 'Select Posting Code',
  selectEntity = 'postingaccount',
  selectOutputValue = 'postingcode',
  selectDisplayLabels = ['postingcode', 'name'],
  selectListOptions,
  // When false, inputs are optional and won’t block form submit
  required = true,
}) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const translate = useLanguage();

  const money = useMoney();
  const updateQt = (value) => {
    setQuantity(value);
  };
  const updatePrice = (value) => {
    setPrice(value);
  };

  useEffect(() => {
    if (current) {
      // When it accesses the /payment/ endpoint,
      // it receives an invoice.item instead of just item
      // and breaks the code, but now we can check if items exists,
      // and if it doesn't we can access invoice.items.

      const { items, invoice } = current;

      if (invoice) {
        const item = invoice[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      } else {
        const item = items[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);

    setTotal(currentTotal);
  }, [price, quantity]);

  return (
    <Row gutter={[6, 6]} style={{ position: 'relative' }} className="ap-invoice-compact">
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={
            required
              ? [
                  {
                    required: true,
                    message: translate(requiredMessage) || requiredMessage,
                  },
                ]
              : []
          }
        >
          <SelectAsync
            entity={selectEntity}
            displayLabels={selectDisplayLabels}
            outputValue={selectOutputValue}
            placeholder={translate(placeholder) || placeholder}
            size="small"
            listOptions={selectListOptions}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={7}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="description Name" size="small" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={required ? [{ required: true }] : []}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            onChange={updateQt}
            size="small"
            parser={(value) => {
              const clean = (value || '').toString().replace(/[^0-9.]/g, '');
              const num = parseFloat(clean);
              return Number.isNaN(num) ? 0 : num;
            }}
            formatter={(value) => {
              const clean = (value || '').toString().replace(/[^0-9.]/g, '');
              return clean;
            }}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={required ? [{ required: true }] : []}>
          <InputNumber
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            size="small"
            style={{ width: '100%' }}
            parser={(value) => {
              const clean = (value || '').toString().replace(/[^0-9.]/g, '');
              const num = parseFloat(clean);
              return Number.isNaN(num) ? 0 : num;
            }}
            formatter={(value) => {
              const clean = (value || '').toString().replace(/[^0-9.]/g, '');
              return clean;
            }}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              size="small"
              formatter={(value) =>
                money.amountFormatter({ amount: value, currency_code: money.currency_code })
              }
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
