import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForgotPassword } from '@/hooks/auth/useForgotPassword'
import { getErrorMessage } from '@/utils/errorUtils'

const schema = z.object({ email: z.string().email('Enter a valid email') })

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => forgotPassword.mutate(v))} className="space-y-4">
        {forgotPassword.isError ? <Alert variant="destructive"><AlertDescription>{getErrorMessage(forgotPassword.error)}</AlertDescription></Alert> : null}
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" size="lg" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Send reset code
        </Button>
      </form>
    </Form>
  )
}
