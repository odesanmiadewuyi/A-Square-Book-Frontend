import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

export default function RoleGuard({ allowed = [], children }) {
  const current = useSelector(selectCurrentAdmin);
  const role = current?.role;
  const isAllowed =
    !allowed || allowed.length === 0 || allowed.includes('*') || (role && allowed.includes(role));

  if (!isAllowed) {
    return <Navigate to='/' replace />;
  }
  return children;
}
