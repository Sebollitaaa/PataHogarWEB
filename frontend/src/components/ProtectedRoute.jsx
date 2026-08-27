import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageSpinner from './ui/FullPageSpinner';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isBooting, user } = useAuth();
  const location = useLocation();

  if (isBooting) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/ingresar" state={{ from: location }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
