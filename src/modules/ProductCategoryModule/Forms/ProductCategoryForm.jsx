import { Form, Input, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function ProductCategoryForm() {
  const translate = useLanguage();
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <Form.Item name="name" label={translate('name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="description" label={translate('description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
