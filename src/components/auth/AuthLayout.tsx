import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
            <Wallet className="size-5" />
          </div>
          <span className="text-lg font-semibold">Expense Manager</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Take control of your finances</h1>
          <p className="max-w-md text-lg text-teal-100/90">
            Track expenses, set goals, and gain insights — all in one premium dashboard.
          </p>
        </div>
        <p className="text-sm text-teal-200/70">© {new Date().getFullYear()} Expense Manager</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-0 shadow-xl sm:border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary lg:hidden">
              <Wallet className="size-5" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer ? <CardFooter className="justify-center text-sm text-muted-foreground">{footer}</CardFooter> : null}
        </Card>
      </div>
    </div>
  )
}
