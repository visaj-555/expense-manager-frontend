import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACCOUNT_TYPE_LABELS } from '@/constants/enums'
import type { Account, AccountType } from '@/types/account.types'

/** Create/edit only allows Bank & Savings as requested; Wallet kept in enum for dashboard. */
const ACCOUNT_TYPE_OPTIONS = ['BANK', 'SAVINGS'] as const satisfies readonly AccountType[]

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(ACCOUNT_TYPE_OPTIONS),
  currentBalance: z.coerce.number().min(0, 'Must be 0 or more'),
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
  onSubmit: (values: AccountFormValues) => void
  isLoading?: boolean
}

export function AccountFormDialog({ open, onOpenChange, account, onSubmit, isLoading }: AccountFormDialogProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 'BANK', currentBalance: 0 },
  })

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type === 'BANK' || account.type === 'SAVINGS' ? account.type : 'BANK',
        currentBalance: account.currentBalance,
      })
    } else {
      form.reset({ name: '', type: 'BANK', currentBalance: 0 })
    }
  }, [account, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {account ? 'Update account details.' : 'Add a bank or savings account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HDFC Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {ACCOUNT_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {account ? 'Save Changes' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
