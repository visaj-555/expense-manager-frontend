import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import type { LoginPayload } from '../../types/auth.types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      const loginData = response.data!;

      tokenStorage.setTokens(loginData.accessToken, loginData.refreshToken);

      const verifyResponse = await authService.verifyToken();
      return verifyResponse.data!.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
      navigate('/dashboard', { replace: true });
    },
  });
}
