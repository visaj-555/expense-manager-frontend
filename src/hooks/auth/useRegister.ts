import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { RegisterPayload } from '../../types/auth.types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (_data, variables) => {
      navigate('/verify-otp', {
        replace: true,
        state: { email: variables.email },
      });
    },
  });
}
