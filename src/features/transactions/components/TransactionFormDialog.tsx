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
import { Textarea } from '@/components/ui/textarea'
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from '@/constants/enums'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useCategories } from '@/features/categories/hooks/useCategories'
import type { PaymentMethod, TransactionType } from '@/types/enums'
import type { Transaction } from '@/types/transaction.types'

const NONE_VALUE = '__none__'

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  type: z.enum(['INCOME', 'EXPENSE'] as const),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  transactionDate: z.string().min(1, 'Date is required'),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET'] as const).optional(),
  notes: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  onSubmit: (values: TransactionFormValues) => void
  isLoading?: boolean
}

export function TransactionFormDialog({ open, onOpenChange, transaction, onSubmit, isLoading }: TransactionFormDialogProps) {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts({
    page: 1,
    limit: 100,
    isArchived: false,
  })
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
    isArchived: false,
  })

  const accounts = accountsData?.data ?? []
  const categories = categoriesData?.data ?? []

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: '',
      type: 'EXPENSE',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: NONE_VALUE,
      paymentMethod: 'CASH',
      notes: '',
      location: '',
    },
  })

  const txType = form.watch('type')
  const filteredCategories = categories.filter((c) => c.type === txType)

  useEffect(() => {
    if (!open) return

    if (transaction) {
      form.reset({
        title: transaction.title,
        type: transaction.type as 'INCOME' | 'EXPENSE',
        amount: transaction.amount,
        transactionDate: transaction.transactionDate.split('T')[0],
        accountId: transaction.account.id,
        categoryId: transaction.category?.id ?? NONE_VALUE,
        paymentMethod: transaction.paymentMethod ?? 'CASH',
        notes: transaction.notes ?? '',
        location: transaction.location ?? '',
      })
      return
    }

    form.reset({
      title: '',
      type: 'EXPENSE',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id ?? '',
      categoryId: NONE_VALUE,
      paymentMethod: 'CASH',
      notes: '',
      location: '',
    })
  }, [transaction, form, open, accounts])

  useEffect(() => {
    const currentCategoryId = form.getValues('categoryId')
    if (!currentCategoryId || currentCategoryId === NONE_VALUE) return

    const stillValid = filteredCategories.some((c) => c.id === currentCategoryId)
    if (!stillValid) {
      form.setValue('categoryId', NONE_VALUE)
    }
  }, [txType, filteredCategories, form])

  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit({
      ...values,
      categoryId: values.categoryId === NONE_VALUE ? undefined : values.categoryId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>Record income or expense transactions.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['INCOME', 'EXPENSE'] as TransactionType[]).map((t) => (
                          <SelectItem key={t} value={t}>
                            {TRANSACTION_TYPE_LABELS[t]}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={accountsLoading || accounts.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            accountsLoading
                              ? 'Loading accounts...'
                              : accounts.length === 0
                                ? 'No accounts found — create one first'
                                : 'Select account'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100]">
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
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
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || NONE_VALUE}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? 'Loading categories...'
                              : filteredCategories.length === 0
                                ? `No ${txType.toLowerCase()} categories`
                                : 'Select category'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100]">
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ` : ''}
                          {c.name}
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
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100]">
                      {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                        <SelectItem key={m} value={m}>
                          {PAYMENT_METHOD_LABELS[m]}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || accounts.length === 0}>
                {transaction ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
