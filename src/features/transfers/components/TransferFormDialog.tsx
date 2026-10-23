import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Textarea } from '@/components/ui/textarea'
import { ACCOUNT_TYPE_LABELS } from '@/constants/enums'
import { formatCurrency, localISODate } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import type { Transfer } from '@/types/transfer.types'

const schema = z
  .object({
    fromAccountId: z.string().min(1, 'Choose an account to send from'),
    toAccountId: z.string().min(1, 'Choose an account to receive'),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    transferDate: z.string().min(1, 'Date is required'),
    note: z.string().max(500).optional(),
  })
  .refine((values) => values.fromAccountId !== values.toAccountId, {
    message: 'Pick two different accounts',
    path: ['toAccountId'],
  })

export type TransferFormValues = z.infer<typeof schema>

interface TransferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  transfer?: Transfer | null
  onSubmit: (values: TransferFormValues) => void
  isLoading?: boolean
}

export function TransferFormDialog({
  open,
  onOpenChange,
  accounts,
  transfer,
  onSubmit,
  isLoading,
}: TransferFormDialogProps) {
  const transferable = accounts.filter((account) => account.type !== 'FIXED_DEPOSIT')
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      transferDate: localISODate(),
      note: '',
    },
  })

  const fromId = form.watch('fromAccountId')
  const toId = form.watch('toAccountId')
  const amount = Number(form.watch('amount') || 0)
  const fromAccount = transferable.find((account) => account.id === fromId)
  const toAccount = transferable.find((account) => account.id === toId)

  useEffect(() => {
    if (!open) return

    if (transfer) {
      form.reset({
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount: transfer.amount,
        transferDate: transfer.transferDate.slice(0, 10),
        note: transfer.note ?? '',
      })
      return
    }

    const options = accounts.filter((account) => account.type !== 'FIXED_DEPOSIT')
    const from = options[0]
    const to = options.find((account) => account.id !== from?.id)

    form.reset({
      fromAccountId: from?.id ?? '',
      toAccountId: to?.id ?? '',
      amount: 0,
      transferDate: localISODate(),
      note: '',
    })
  }, [accounts, form, open, transfer])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{transfer ? 'Update transfer' : 'Transfer money'}</DialogTitle>
          <DialogDescription>
            Move money from one account to another. The source is deducted and the destination is credited. This is
            not spending or income.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {transferable.length < 2 ? (
              <Alert>
                <AlertDescription>You need at least two accounts to move money.</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fromAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Source account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transferable.map((account) => (
                          <SelectItem key={account.id} value={account.id} disabled={account.id === toId}>
                            {account.name} · {ACCOUNT_TYPE_LABELS[account.type]} ·{' '}
                            {formatCurrency(account.currentBalance)}
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
                name="toAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Destination account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transferable.map((account) => (
                          <SelectItem key={account.id} value={account.id} disabled={account.id === fromId}>
                            {account.name} · {ACCOUNT_TYPE_LABELS[account.type]} ·{' '}
                            {formatCurrency(account.currentBalance)}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" placeholder="0" {...field} />
                  </FormControl>
                  {fromAccount && amount > fromAccount.currentBalance ? (
                    <FormDescription className="text-amber-700 dark:text-amber-400">
                      This is more than {fromAccount.name} currently shows ({formatCurrency(fromAccount.currentBalance)}
                      ).
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transferDate"
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional note" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fromAccount && toAccount && amount > 0 ? (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="mb-2 flex items-center justify-center gap-2 font-medium">
                  <span>{fromAccount.name}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span>{toAccount.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <p>
                    {ACCOUNT_TYPE_LABELS[fromAccount.type]} {formatCurrency(fromAccount.currentBalance)} →{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(fromAccount.currentBalance - amount)}
                    </span>
                  </p>
                  <p className="text-right">
                    {ACCOUNT_TYPE_LABELS[toAccount.type]} {formatCurrency(toAccount.currentBalance)} →{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(toAccount.currentBalance + amount)}
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || transferable.length < 2}>
                {transfer ? 'Save transfer' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
