import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isBootstrapping = false;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
    },
    setBootstrapping(state, action: PayloadAction<boolean>) {
      state.isBootstrapping = action.payload;
    },
  },
});

export const { setUser, clearAuth, setBootstrapping } = authSlice.actions;
export default authSlice.reducer;
