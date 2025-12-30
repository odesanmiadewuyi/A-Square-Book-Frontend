import { useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, message, InputNumber, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import SelectAsync from '@/components/SelectAsync';

export default function GLJournalForm({ current }) {
  const translate = useLanguage();
  const form = Form.useFormInstance();

  const fetchAndSetLines = async (journalId) => {
    const { success, result } = await request.filter({
      entity: 'gljournalline',
      options: { filter: 'journal', equal: journalId },
    });
    if (success && Array.isArray(result)) {
      const lines = result
        .sort((a, b) => (a.lineNo || 0) - (b.lineNo || 0))
        .map((l) => ({
          postingcode: l.accountCode,
          debit: l.debit || 0,
          credit: l.credit || 0,
          particular:
            typeof l.particular === 'string' && l.particular.trim()
              ? l.particular
              : typeof l.description === 'string' && l.description.trim()
                ? l.description
                : '',
        }));
      const sum = (arr, key) => arr.reduce((acc, it) => acc + (parseFloat(it?.[key]) || 0), 0);
      form.setFieldsValue({
        lines,
        totalDebit: sum(lines, 'debit'),
        totalCredit: sum(lines, 'credit'),
      });
    }
  };

  const backfillParticulars = async () => {
    try {
      if (!current?._id) return;
      await request.post({ entity: 'gljournalline/backfill-particular', jsonData: { journal: current._id } });
      await fetchAndSetLines(current._id);
      message.success('Particulars backfilled');
    } catch (e) {
      message.error('Backfill failed');
    }
  };

  const suggestNumber = async (notify = false) => {
    try {
      const dt = form.getFieldValue('date');
      const query = dt && dt.toISOString ? `?date=${encodeURIComponent(dt.toISOString())}` : '';
      const { success, result } = await request.get({ entity: `gljournal/next-number${query}` });
      if (success && result?.number) {
        form.setFieldsValue({ number: result.number });
        if (notify) message.success(`Suggested ${result.number}`);
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    suggestNumber(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (current && current._id) {
          try {
            await request.post({
              entity: 'gljournalline/backfill-particular',
              jsonData: { journal: current._id },
            });
          } catch (e) {}
          await fetchAndSetLines(current._id);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [current && current._id]);

  const lineHeaderStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#5c6b77',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  };

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} lg={8}>
          <Form.Item name='number' label='Number' rules={[{ required: true }]}>
            <Input
              size='small'
              placeholder='e.g. JRN-2025-0001'
              addonAfter={
                <Button size='small' onClick={() => suggestNumber(true)}>
                  Suggest
                </Button>
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Form.Item name='date' label='Date' rules={[{ required: true }]}>
            <DatePicker size='small' style={{ width: '100%' }} onChange={() => suggestNumber(false)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Form.Item name='period' label='Period' rules={[{ required: true }]}>
            <SelectAsync
              size='small'
              entity={'glperiod'}
              outputValue={'_id'}
              displayLabels={['fiscalYear', 'month']}
              placeholder='Select period'
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={4}>
          <Form.Item name='status' label='Status' initialValue={'draft'}>
            <Select
              size='small'
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'posted', label: 'Posted' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <Form.Item name='description' label={translate('description')}>
            <Input.TextArea rows={2} size='small' />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>Journal Lines</div>
        {current?._id && (
          <Button size='small' onClick={backfillParticulars}>
            Backfill Particulars
          </Button>
        )}
      </div>

      <Form.List name='lines' initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, background: '#fafafa' }}>
            <Row gutter={[8, 6]} style={{ marginBottom: 6 }}>
              <Col xs={24} md={8} lg={6} style={lineHeaderStyle}>
                Posting Code
              </Col>
              <Col xs={12} md={4} lg={4} style={lineHeaderStyle}>
                Debit
              </Col>
              <Col xs={12} md={4} lg={4} style={lineHeaderStyle}>
                Credit
              </Col>
              <Col xs={24} md={6} lg={8} style={lineHeaderStyle}>
                Particular
              </Col>
              <Col xs={24} md={2} lg={2} />
            </Row>
            {fields.map((field) => {
              const { key, ...restField } = field;
              return (
                <Row key={key} gutter={[8, 8]} align='middle' style={{ marginBottom: 8 }}>
                  <Col xs={24} md={8} lg={6}>
                    <Form.Item
                      {...restField}
                      name={[field.name, 'postingcode']}
                      rules={[{ required: true, message: 'Posting code required' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <SelectAsync
                        size='small'
                        entity={'postingaccount'}
                        outputValue={'postingcode'}
                        displayLabels={['postingcode', 'name']}
                        placeholder='Select posting code'
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4} lg={4}>
                    <Form.Item
                      {...restField}
                      name={[field.name, 'debit']}
                      initialValue={0}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber size='small' min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4} lg={4}>
                    <Form.Item
                      {...restField}
                      name={[field.name, 'credit']}
                      initialValue={0}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber size='small' min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6} lg={8}>
                    <Form.Item
                      {...restField}
                      name={[field.name, 'particular']}
                      rules={[{ required: true, message: 'Particular required' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input size='small' placeholder='Particular' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={2} lg={2} style={{ textAlign: 'right' }}>
                    <Button danger size='small' type='link' onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  </Col>
                </Row>
              );
            })}
            <Button size='small' onClick={() => add()} type='dashed' block>
              Add Line
            </Button>
          </div>
        )}
      </Form.List>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12}>
          <Form.Item name='totalDebit' label='Total Debit'>
            <InputNumber disabled size='small' style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name='totalCredit' label='Total Credit'>
            <InputNumber disabled size='small' style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
