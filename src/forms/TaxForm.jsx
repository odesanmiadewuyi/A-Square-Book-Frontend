import React from 'react';
import {Switch, Form, Input, InputNumber} from 'antd';
import SelectAsync from '@/components/SelectAsync';
import {CloseOutlined, CheckOutlined} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function TaxForm({isUpdateForm = false, showAccountCode = false}) {
    const translate = useLanguage();
    return (
        <>
            <Form.Item
                label={translate('name')}
                name="taxName"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>

            {showAccountCode && (
              <Form.Item label={'Posting Code'} name={'accountcode'}>
                <SelectAsync
                  entity={'postingaccount'}
                  outputValue={'postingcode'}
                  displayLabels={['postingcode','name']}
                  placeholder={'Select Posting Code'}
                />
              </Form.Item>
            )}
            <Form.Item
                label={translate('Value')}
                name="taxValue"
                rules={[
                    {
                        required: true,
                        message: 'Please input tax value!',
                        type: 'number',
                        min: 0,
                        max: 100
                    },
                ]}
            >
                <InputNumber min={0} max={100} suffix={"%"} style={{width: '100%'}}/>
            </Form.Item>

            <Form.Item
                label={translate('enabled')}
                name="enabled"
                style={{
                    display: 'inline-block',
                    width: 'calc(50%)',
                    paddingRight: '5px',
                }}
                valuePropName="checked"
                initialValue={true}
            >
                <Switch checkedChildren={<CheckOutlined/>} unCheckedChildren={<CloseOutlined/>}/>
            </Form.Item>
            <Form.Item
                label={translate('Default')}
                name="isDefault"
                style={{
                    display: 'inline-block',
                    width: 'calc(50%)',
                    paddingLeft: '5px',
                }}
                valuePropName="checked"
            >
                <Switch checkedChildren={<CheckOutlined/>} unCheckedChildren={<CloseOutlined/>}/>
            </Form.Item>
        </>
    );
}
