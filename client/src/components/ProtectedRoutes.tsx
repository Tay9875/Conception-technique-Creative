import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    // Redirige vers /login et conserve le chemin qu'on voulait
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
