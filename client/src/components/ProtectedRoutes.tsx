import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { SessionUser } from '../types';

interface ProtectedRouteProps {
  user: SessionUser | null;
  children: ReactElement;
}

function ProtectedRoute({ user, children }: ProtectedRouteProps): ReactElement {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
