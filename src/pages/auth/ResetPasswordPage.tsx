import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import ResetPasswordForm from '@/features/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set new password"
      description="Choose a strong password for your account."
      footer={<Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
