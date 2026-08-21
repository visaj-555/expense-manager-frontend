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
import { ACCOUNT_TYPE_LABELS, FD_COMPOUNDING_LABELS } from '@/constants/enums'
import { localISODate } from '@/lib/utils'
import type { Account, AccountType, FdCompounding } from '@/types/account.types'

const ACCOUNT_TYPE_OPTIONS = ['BANK', 'SAVINGS', 'WALLET', 'FIXED_DEPOSIT'] as const satisfies readonly AccountType[]
const COMPOUNDING_OPTIONS = ['MONTHLY', 'QUARTERLY', 'YEARLY'] as const satisfies readonly FdCompounding[]

const accountSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(ACCOUNT_TYPE_OPTIONS),
    currentBalance: z.coerce.number().min(0, 'Must be 0 or more'),
    interestRate: z.coerce.number().optional(),
    startDate: z.string().optional(),
    tenureMonths: z.coerce.number().optional(),
    compounding: z.enum(COMPOUNDING_OPTIONS).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'FIXED_DEPOSIT') return
    if (data.interestRate == null || Number.isNaN(data.interestRate) || data.interestRate < 0.01) {
      ctx.addIssue({ code: 'custom', path: ['interestRate'], message: 'Interest rate is required' })
    }
    if (!data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date is required' })
    }
    if (data.tenureMonths == null || Number.isNaN(data.tenureMonths) || data.tenureMonths < 1) {
      ctx.addIssue({ code: 'custom', path: ['tenureMonths'], message: 'Tenure in months is required' })
    }
  })

export type AccountFormValues = z.infer<typeof accountSchema>

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
    defaultValues: {
      name: '',
      type: 'BANK',
      currentBalance: 0,
      interestRate: 7,
      startDate: localISODate(),
      tenureMonths: 12,
      compounding: 'QUARTERLY',
    },
  })

  const selectedType = form.watch('type')
  const isFd = selectedType === 'FIXED_DEPOSIT'

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type,
        currentBalance: account.fd?.principal ?? account.currentBalance,
        interestRate: account.fd?.interestRate ?? 7,
        startDate: account.fd?.startDate?.slice(0, 10) ?? localISODate(),
        tenureMonths: account.fd?.tenureMonths ?? 12,
        compounding: account.fd?.compounding ?? 'QUARTERLY',
      })
      return
    }

    form.reset({
      name: '',
      type: 'BANK',
      currentBalance: 0,
      interestRate: 7,
      startDate: localISODate(),
      tenureMonths: 12,
      compounding: 'QUARTERLY',
    })
  }, [account, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {isFd
              ? 'Interest is calculated when you open the app — no daily job needed.'
              : account
                ? 'Rename or change type. To hardcode today\'s amount, use Set what I have now on the card.'
                : 'Add a bank, savings, cash, or fixed deposit. Enter what is in it right now.'}
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
                    <Input placeholder={isFd ? 'e.g. SBI FD Apr 2026' : 'e.g. HDFC Bank'} {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={Boolean(account)}>
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
            {!account || isFd ? (
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isFd ? 'Principal (amount deposited)' : 'What do you have right now?'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isFd
                        ? 'The amount you booked. Today\'s value grows from this using the rate below.'
                        : 'You do not need to remember the opening balance. Catch-up expenses you add later will not change this snapshot.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isFd ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest rate % p.a.</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0.01" max="30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tenureMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenure (months)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="1" max="120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compounding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compounding</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPOUNDING_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {FD_COMPOUNDING_LABELS[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Indian bank FDs are usually quarterly.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

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
