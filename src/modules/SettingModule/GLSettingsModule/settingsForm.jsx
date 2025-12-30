import { Form, Input } from 'antd';
import SelectAsync from '@/components/SelectAsync';

export default function SettingsForm(){
  return (
    <>
      <Form.Item
        name='gl_opening_balance_offset_postingcode'
        label='Opening Balance Offset Posting Code'
        tooltip='Default GL posting code used to balance bank opening entries when no offset is chosen on the form.'
        rules={[{ required: false }]}
      >
        <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select default offset posting code' />
      </Form.Item>
      <Form.Item name='gl_reconcile_match_days' label='Reconcile Match Window (days)'>
        <Input type='number' min={0} />
      </Form.Item>
      <Form.Item name='gl_reconcile_match_amount_tolerance' label='Match Amount Tolerance'>
        <Input type='number' min={0} step='0.01' />
      </Form.Item>
      <Form.Item name='gl_reconcile_default_bank_charge_postingcode' label='Default Bank Charge/Offset Posting Code'>
        <SelectAsync entity={'postingaccount'} outputValue={'postingcode'} displayLabels={['postingcode','name']} placeholder='Select default posting code' />
      </Form.Item>
    </>
  );
}
