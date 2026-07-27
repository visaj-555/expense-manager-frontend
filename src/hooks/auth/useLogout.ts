import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import { queryClient } from '../../lib/queryClient';

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(() => {
    tokenStorage.clearTokens();
    dispatch(clearAuth());
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);
}
