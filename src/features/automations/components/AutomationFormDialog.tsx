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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FREQUENCY_LABELS, PAYMENT_METHOD_LABELS } from '@/constants/enums'
import { localISODate } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import type { Automation } from '@/types/automation.types'
import type { Category } from '@/types/category.types'
import type { PaymentMethod, RecurringFrequency } from '@/types/enums'

const FREQUENCY_OPTIONS = ['MONTHLY', 'WEEKLY', 'YEARLY', 'DAILY'] as const satisfies readonly RecurringFrequency[]
const PAYMENT_OPTIONS = ['UPI', 'NET_BANKING', 'DEBIT_CARD', 'CREDIT_CARD', 'CASH', 'WALLET'] as const satisfies readonly PaymentMethod[]

const schema = z.object({
  title: z.string().min(1, 'Name is required').max(150),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().min(1, 'Category is required'),
  paymentMethod: z.enum(PAYMENT_OPTIONS),
  frequency: z.enum(FREQUENCY_OPTIONS),
  startDate: z.string().min(1, 'Deduction date is required'),
})

export type AutomationFormValues = z.infer<typeof schema>

interface AutomationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  automation?: Automation | null
  accounts: Account[]
  categories: Category[]
  onSubmit: (values: AutomationFormValues) => void
  isLoading?: boolean
}

export function AutomationFormDialog({
  open,
  onOpenChange,
  automation,
  accounts,
  categories,
  onSubmit,
  isLoading,
}: AutomationFormDialogProps) {
  const expenseCategories = categories.filter((category) => category.type === 'EXPENSE')
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      amount: 4000,
      accountId: '',
      categoryId: '',
      paymentMethod: 'UPI',
      frequency: 'MONTHLY',
      startDate: localISODate(),
    },
  })

  useEffect(() => {
    if (!open) return

    const expenseOnly = categories.filter((category) => category.type === 'EXPENSE')
    const sip = expenseOnly.find((category) => category.name.toLowerCase() === 'sip')
    const bank = accounts.find((account) => account.type === 'BANK') ?? accounts[0]

    if (automation) {
      form.reset({
        title: automation.title,
        amount: automation.amount,
        accountId: automation.account.id,
        categoryId: automation.category?.id ?? '',
        paymentMethod: automation.paymentMethod,
        frequency: automation.frequency,
        startDate: automation.nextRunDate.slice(0, 10),
      })
      return
    }

    form.reset({
      title: sip ? 'SIP' : '',
      amount: 4000,
      accountId: bank?.id ?? '',
      categoryId: sip?.id ?? expenseOnly[0]?.id ?? '',
      paymentMethod: 'UPI',
      frequency: 'MONTHLY',
      startDate: localISODate(),
    })
  }, [accounts, automation, categories, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{automation ? 'Update automation' : 'Automate a deduction'}</DialogTitle>
          <DialogDescription>
            Set the amount and deduction date. It will post by UPI into the category you pick — SIP, rent, or anything else.
            You can change the amount any time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HDFC SIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Change this whenever the SIP or bill amount changes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next deduction date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>On this date the app posts a UPI expense automatically.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {FREQUENCY_LABELS[frequency]}
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid by</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_OPTIONS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {PAYMENT_METHOD_LABELS[method]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} disabled={accounts.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={accounts.length === 0 ? 'Create an account first' : 'Select account'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} disabled={expenseCategories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={expenseCategories.length === 0 ? 'Create a category first' : 'SIP, rent, ...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon ? `${category.icon} ` : ''}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>SIP, PG, Maid — whatever this auto-debit should count as.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || accounts.length === 0 || expenseCategories.length === 0}>
                {automation ? 'Save changes' : 'Start automation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
