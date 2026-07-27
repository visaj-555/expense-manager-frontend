import { Navigate, Outlet } from 'react-router-dom';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';
import { useAppSelector } from '../store/hooks';

export default function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAppSelector((state) => state.auth);

  if (isBootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
