import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import RegisterForm from '@/features/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start tracking expenses in under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthLayout>
  )
}
