import { Form, InputNumber } from 'antd';
import { useMoney } from '@/settings';

export default function MoneyInputFormItem({ updatePrice, value = 0, readOnly = false, size }) {
  const { amountFormatter, cent_precision, currency_code } = useMoney();

  return (
    <Form.Item>
      <InputNumber
        readOnly={readOnly}
        className="moneyInput"
        onChange={updatePrice}
        precision={cent_precision ? cent_precision : 2}
        value={amountFormatter({ amount: value, currency_code: currency_code })}
        controls={false}
        size={size}
        style={{ width: '100%' }}
        formatter={(value) => amountFormatter({ amount: value, currency_code })}
      />
    </Form.Item>
  );
}
