import { Navigate, Outlet } from 'react-router-dom';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';
import { useAppSelector } from '../store/hooks';

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAppSelector((state) => state.auth);

  if (isBootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
