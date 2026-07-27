import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/auth/useLogin'
import { getErrorMessage } from '@/utils/errorUtils'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginForm() {
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message
  const login = useLogin()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="space-y-4">
        {successMessage ? (
          <Alert variant="success"><AlertDescription>{successMessage}</AlertDescription></Alert>
        ) : null}
        {login.isError ? (
          <Alert variant="destructive"><AlertDescription>{getErrorMessage(login.error, 'Login failed')}</AlertDescription></Alert>
        ) : null}

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Enter your password" autoComplete="current-password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
          {login.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
