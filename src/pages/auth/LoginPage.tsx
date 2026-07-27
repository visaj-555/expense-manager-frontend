import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/features/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue managing your expenses."
      footer={<>Don&apos;t have an account? <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link></>}
    >
      <LoginForm />
    </AuthLayout>
  )
}
