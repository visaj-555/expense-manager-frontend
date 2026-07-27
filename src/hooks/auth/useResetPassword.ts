import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { ResetPasswordPayload } from '../../types/auth.types';

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successful! Please sign in with your new password.' },
      });
    },
  });
}
