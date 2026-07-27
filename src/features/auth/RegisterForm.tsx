import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRegister } from '@/hooks/auth/useRegister'
import { PASSWORD_HINT, PASSWORD_REGEX, getErrorMessage } from '@/utils/errorUtils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function RegisterForm() {
  const register = useRegister()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ name, email, password }) => register.mutate({ name, email, password }))} className="space-y-4">
        {register.isError ? <Alert variant="destructive"><AlertDescription>{getErrorMessage(register.error)}</AlertDescription></Alert> : null}
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Full name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>
          {register.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create account
        </Button>
      </form>
    </Form>
  )
}
