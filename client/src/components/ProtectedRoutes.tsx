import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ user, children, requiredRole }) {
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
