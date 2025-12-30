import { Form, Input, DatePicker, Select, Button, message, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import dayjs from 'dayjs';

export default function GLPeriodForm(){
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const fy = Form.useWatch('fiscalYear', form);
  const mo = Form.useWatch('month', form);

  const normalizeMonthDates = () => {
    const y = parseInt((fy || '').toString(), 10);
    const m = parseInt((mo || '').toString(), 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      const start = dayjs(`${y}-${String(m).padStart(2,'0')}-01`);
      const end = start.endOf('month');
      form.setFieldsValue({ startDate: start, endDate: end });
    }
  };

  // Auto-adjust dates when year/month changes
  normalizeMonthDates();

  const generateYear = async () => {
    const y = parseInt((fy || '').toString(), 10);
    if (isNaN(y)) {
      message.warning('Enter Fiscal Year first');
      return;
    }
    try {
      const { success, result, message: msg } = await request.post({ entity: 'glperiod/generate-year', jsonData: { fiscalYear: y } });
      if (success) message.success(`Generated ${result.created} period(s), skipped ${result.skipped}`);
      else message.error(msg || 'Could not generate periods');
    } catch {
      message.error('Could not generate periods');
    }
  };
  return (
    <>
      <div style={{ background: '#fbfcfe', border: '1px solid #eef2f7', padding: 16, borderRadius: 10 }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 10 }}>
          <Button size='small' onClick={generateYear}>Generate 12 months for year</Button>
        </div>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name='fiscalYear' label='Fiscal Year' rules={[{ required: true }]}>
              <Input size='small' placeholder='e.g. 2025' type='number' />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='month' label='Month' rules={[{ required: true }]}>
              <Select
                size='small'
                options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='startDate'
              label='Start Date'
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(){
                    const y = parseInt((getFieldValue('fiscalYear')||'').toString(),10);
                    const m = parseInt((getFieldValue('month')||'').toString(),10);
                    if (isNaN(y) || isNaN(m)) return Promise.resolve();
                    const expected = dayjs(`${y}-${String(m).padStart(2,'0')}-01`);
                    const val = getFieldValue('startDate');
                    if (!val) return Promise.resolve();
                    return dayjs(val).isSame(expected, 'day') ? Promise.resolve() : Promise.reject(new Error('Must be first day of selected month'));
                  }
                })
              ]}
            >        
              <DatePicker size='small' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name='endDate'
              label='End Date'
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(){
                    const y = parseInt((getFieldValue('fiscalYear')||'').toString(),10);
                    const m = parseInt((getFieldValue('month')||'').toString(),10);
                    if (isNaN(y) || isNaN(m)) return Promise.resolve();
                    const expected = dayjs(`${y}-${String(m).padStart(2,'0')}-01`).endOf('month');
                    const val = getFieldValue('endDate');
                    if (!val) return Promise.resolve();
                    return dayjs(val).isSame(expected, 'day') ? Promise.resolve() : Promise.reject(new Error('Must be last day of selected month'));
                  }
                })
              ]}
            >        
              <DatePicker size='small' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='status' label='Status' initialValue={'open'} rules={[{ required: true }]}>
              <Select
                size='small'
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'locked', label: 'Locked' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </>
  );
}
