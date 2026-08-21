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
import { formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/account.types'

const schema = z.object({
  currentBalance: z.coerce.number().min(0, 'Must be 0 or more'),
})

type FormValues = z.infer<typeof schema>

interface SetBalanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Account | null
  onSubmit: (currentBalance: number) => void
  isLoading?: boolean
}

export function SetBalanceDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  isLoading,
}: SetBalanceDialogProps) {
  const isCash = account?.type === 'WALLET'
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentBalance: 0 },
  })

  useEffect(() => {
    if (!open || !account) return
    form.reset({ currentBalance: Math.max(0, account.currentBalance) })
  }, [account, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCash ? 'I counted this cash' : 'Set what I have now'}</DialogTitle>
          <DialogDescription>
            Type the amount that is actually there today. You do not need the opening balance.
            Old expenses stay in history and will not rewrite this number.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSubmit(values.currentBalance))}
            className="space-y-4"
          >
            {account ? (
              <p className="text-sm text-muted-foreground">
                {account.name} currently shows {formatCurrency(account.currentBalance)}
              </p>
            ) : null}
            <FormField
              control={form.control}
              name="currentBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isCash ? 'Cash in hand' : 'Current balance'}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" autoFocus {...field} />
                  </FormControl>
                  <FormDescription>
                    Count the locker, wallet, or bank app — then save. That becomes today&apos;s snapshot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !account}>
                Save this amount
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
