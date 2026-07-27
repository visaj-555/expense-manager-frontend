import { axiosInstance } from '../api/axiosInstance';
import type { ApiResponse } from '../types/api.types';
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginData,
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  User,
  VerifyForgotOtpPayload,
  VerifyOtpPayload,
} from '../types/auth.types';

export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<unknown>>('/auth/register', payload);
    return data;
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<void>>('/auth/verify-otp', payload);
    return data;
  },

  resendOtp: async (payload: ResendOtpPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/resend-otp', payload);
    return data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<LoginData>>('/auth/login', payload);
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await axiosInstance.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    );
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', payload);
    return data;
  },

  verifyForgotOtp: async (payload: VerifyForgotOtpPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<{ resetToken: string }>>(
      '/auth/verify-forgot-otp',
      payload,
    );
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/reset-password', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/change-password', payload);
    return data;
  },

  verifyToken: async () => {
    const { data } = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/verify-token');
    return data;
  },
};
