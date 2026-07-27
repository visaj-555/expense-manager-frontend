export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  id: string;
  userId: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export type OtpType = 'EMAIL_VERIFICATION' | 'FORGOT_PASSWORD';

export interface ResendOtpPayload {
  email: string;
  otpType: OtpType;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyForgotOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}
