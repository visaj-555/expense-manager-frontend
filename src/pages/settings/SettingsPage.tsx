import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardCardToggles } from '@/features/dashboard/components/DashboardCardToggles'
import { useDashboardCards } from '@/features/dashboard/hooks/useDashboardCards'
import { ExportDataForm } from '@/features/export/components/ExportDataForm'
import { useExportData } from '@/features/export/hooks/useExportData'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { authService } from '@/services/auth.service'
import { useAppSelector } from '@/store/hooks'
import { PASSWORD_HINT, PASSWORD_REGEX, getErrorMessage } from '@/utils/errorUtils'
import { useMutation } from '@tanstack/react-query'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user)
  const { visibility, setCard, reset } = useDashboardCards()
  const exportData = useExportData()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const changePassword = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success('Password updated successfully')
      form.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Manage your account preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{user?.role?.toLowerCase()}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Light or dark. System follows your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Dashboard cards</CardTitle>
            <CardDescription>Show or hide tiles on the dashboard. Saved on this device.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Show all
          </Button>
        </CardHeader>
        <CardContent>
          <DashboardCardToggles visibility={visibility} onToggle={setCard} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export data</CardTitle>
          <CardDescription>
            Download a month, a year, or everything as JSON or Excel. Accounts and categories are always included so names stay readable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportDataForm
            isLoading={exportData.isPending}
            onExport={(request) =>
              exportData.mutate(request, {
                onSuccess: (payload) => {
                  toast.success(
                    `Downloaded ${payload.summary.transactions} transaction${payload.summary.transactions === 1 ? '' : 's'}`,
                  )
                },
                onError: (err) => toast.error(getErrorMessage(err)),
              })
            }
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => changePassword.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="currentPassword" render={({ field }) => (
                <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="newPassword" render={({ field }) => (
                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={changePassword.isPending}>Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
