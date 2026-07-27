import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import VerifyOtpForm from '@/features/auth/VerifyOtpForm'

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox."
      footer={<>Wrong email? <Link to="/register" className="font-medium text-primary hover:underline">Go back</Link></>}
    >
      <VerifyOtpForm />
    </AuthLayout>
  )
}
