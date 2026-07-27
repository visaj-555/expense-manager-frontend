import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import VerifyForgotOtpForm from '@/features/auth/VerifyForgotOtpForm'

export default function VerifyForgotOtpPage() {
  return (
    <AuthLayout
      title="Enter reset code"
      description="Check your email for the 6-digit verification code."
      footer={<>Need a new code? <Link to="/forgot-password" className="font-medium text-primary hover:underline">Start over</Link></>}
    >
      <VerifyForgotOtpForm />
    </AuthLayout>
  )
}
