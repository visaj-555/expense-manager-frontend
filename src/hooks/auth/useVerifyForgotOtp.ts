import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { VerifyForgotOtpPayload } from '../../types/auth.types';

export function useVerifyForgotOtp() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyForgotOtpPayload) => authService.verifyForgotOtp(payload),
    onSuccess: (response) => {
      const resetToken = response.data!.resetToken;
      navigate('/reset-password', {
        replace: true,
        state: { resetToken },
      });
    },
  });
}
