import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import ForgotPasswordForm from '@/features/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email and we'll send you a reset code."
      footer={<>Remember your password? <Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></>}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
