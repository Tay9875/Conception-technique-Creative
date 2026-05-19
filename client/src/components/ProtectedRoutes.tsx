import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { SessionUser } from '../types';

interface ProtectedRouteProps {
  user: SessionUser | null;
  children: ReactElement;
  requiredRole?: number;
}

function ProtectedRoute({ user, children, requiredRole }: ProtectedRouteProps): ReactElement {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role_id !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
