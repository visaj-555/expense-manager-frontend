import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { VerifyOtpPayload } from '../../types/auth.types';

export function useVerifyOtp() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { message: 'Email verified! You can now sign in.' },
      });
    },
  });
}
