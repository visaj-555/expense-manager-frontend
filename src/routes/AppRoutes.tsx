import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthBootstrap } from '@/hooks/auth/useAuthBootstrap'
import AppLayout from '@/layouts/AppLayout'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyForgotOtpPage from '@/pages/auth/VerifyForgotOtpPage'
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage'
import AccountsPage from '@/pages/accounts/AccountsPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import CategoriesPage from '@/pages/categories/CategoriesPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import GoalsPage from '@/pages/goals/GoalsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import TransactionsPage from '@/pages/transactions/TransactionsPage'
import GuestRoute from '@/routes/GuestRoute'
import ProtectedRoute from '@/routes/ProtectedRoute'

function AppRoutesContent() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-forgot-otp" element={<VerifyForgotOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppRoutesContent />
    </BrowserRouter>
  )
}
