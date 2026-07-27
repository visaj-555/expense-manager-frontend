import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { clearAuth, setBootstrapping, setUser } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import { tokenStorage } from '../../utils/tokenStorage';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        dispatch(clearAuth());
        return;
      }

      try {
        const response = await authService.verifyToken();

        if (!cancelled) {
          dispatch(setUser(response.data!.user));
        }
      } catch {
        if (!cancelled) {
          tokenStorage.clearTokens();
          dispatch(clearAuth());
        }
      } finally {
        if (!cancelled) {
          dispatch(setBootstrapping(false));
        }
      }
    }

    dispatch(setBootstrapping(true));
    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
