import { ErpLayout } from '@/layout';
import CreatePayment from './components/CreatePayment';

export default function CreatePaymentModule({ config }) {
  return (
    <ErpLayout>
      <CreatePayment config={config} />
    </ErpLayout>
  );
}

