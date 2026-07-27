import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { ForgotPasswordPayload } from '../../types/auth.types';

export function useForgotPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    onSuccess: (_data, variables) => {
      navigate('/verify-forgot-otp', {
        replace: true,
        state: { email: variables.email },
      });
    },
  });
}
