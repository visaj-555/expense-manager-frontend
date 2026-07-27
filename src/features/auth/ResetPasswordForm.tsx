import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useResetPassword } from '@/hooks/auth/useResetPassword'
import { PASSWORD_HINT, PASSWORD_REGEX, getErrorMessage } from '@/utils/errorUtils'

const schema = z.object({
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function ResetPasswordForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const resetToken = (location.state as { resetToken?: string } | null)?.resetToken ?? ''
  const resetPassword = useResetPassword()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => { if (!resetToken) navigate('/forgot-password', { replace: true }) }, [resetToken, navigate])
  if (!resetToken) return null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ password }) => resetPassword.mutate({ resetToken, newPassword: password }))} className="space-y-4">
        {resetPassword.isError ? <Alert variant="destructive"><AlertDescription>{getErrorMessage(resetPassword.error)}</AlertDescription></Alert> : null}
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>New password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" size="lg" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Reset password
        </Button>
      </form>
    </Form>
  )
}
