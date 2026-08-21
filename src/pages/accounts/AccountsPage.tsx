import { useState } from 'react'
import { Banknote, CreditCard, Landmark, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { AccountFormDialog } from '@/features/accounts/components/AccountFormDialog'
import { SetBalanceDialog } from '@/features/accounts/components/SetBalanceDialog'
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/features/accounts/hooks/useAccounts'
import { ACCOUNT_TYPE_LABELS, DEFAULT_PAGE_SIZE, FD_COMPOUNDING_LABELS } from '@/constants/enums'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import type { AccountFormValues } from '@/features/accounts/components/AccountFormDialog'
import { getErrorMessage } from '@/utils/errorUtils'

export default function AccountsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [balanceAccount, setBalanceAccount] = useState<Account | null>(null)

  const { data, isLoading, isError, error, refetch } = useAccounts({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    isArchived: false,
  })

  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const handleSubmit = (values: AccountFormValues) => {
    const isFd = values.type === 'FIXED_DEPOSIT'
    const payload = isFd
      ? {
          name: values.name,
          type: values.type,
          currentBalance: values.currentBalance,
          interestRate: values.interestRate,
          startDate: values.startDate,
          tenureMonths: values.tenureMonths,
          compounding: values.compounding,
        }
      : {
          name: values.name,
          type: values.type,
          currentBalance: values.currentBalance,
        }

    if (editing) {
      updateAccount.mutate(
        {
          id: editing.id,
          payload: isFd
            ? {
                name: values.name,
                currentBalance: values.currentBalance,
                interestRate: values.interestRate,
                startDate: values.startDate,
                tenureMonths: values.tenureMonths,
                compounding: values.compounding,
              }
            : { name: values.name },
        },
        {
          onSuccess: () => {
            toast.success('Account updated')
            setDialogOpen(false)
            setEditing(null)
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      )
      return
    }

    createAccount.mutate(payload, {
      onSuccess: () => {
        toast.success(isFd ? 'Fixed Deposit added' : 'Account created')
        setDialogOpen(false)
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }

  const handleSetBalance = (currentBalance: number) => {
    if (!balanceAccount) return
    updateAccount.mutate(
      { id: balanceAccount.id, payload: { currentBalance } },
      {
        onSuccess: () => {
          toast.success(`Saved ${formatCurrency(currentBalance)} as today's amount`)
          setBalanceAccount(null)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )
  }

  const handleDelete = (account: Account) => {
    if (!confirm(`Delete "${account.name}"?`)) return
    deleteAccount.mutate(account.id, {
      onSuccess: () => toast.success('Account deleted'),
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Bank and cash are snapshots. Fixed Deposits grow when you open Accounts or the Dashboard — no daily job."
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="size-4" />
            Add Account
          </Button>
        }
      />

      <Input
        placeholder="Search accounts..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={CreditCard}
          title="No accounts yet"
          description="Create your first account and type what is in it right now."
          actionLabel="Add Account"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <>
          <Alert>
            <AlertDescription>
              Wrong number? Count cash or open the bank app, then tap <strong>Set what I have now</strong>.
              Adding old expenses after that will not push the balance negative.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((account) => {
              const isFd = account.type === 'FIXED_DEPOSIT'
              return (
              <Card key={account.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isFd ? (
                        <DropdownMenuItem onClick={() => setBalanceAccount(account)}>
                          <Banknote className="size-4" /> Set what I have now
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem onClick={() => { setEditing(account); setDialogOpen(true) }}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p
                    className={cn(
                      'text-2xl font-semibold',
                      account.currentBalance < 0 && 'text-destructive',
                    )}
                  >
                    {formatCurrency(account.currentBalance)}
                  </p>
                  {isFd && account.fd ? (
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Landmark className="size-3.5" />
                        {account.fd.isMatured
                          ? 'Matured — value is locked at maturity amount'
                          : `Grown from ${formatCurrency(account.fd.principal)} · ${account.fd.interestRate}% ${FD_COMPOUNDING_LABELS[account.fd.compounding]}`}
                      </p>
                      <p>
                        Interest so far {formatCurrency(account.fd.accruedInterest)} · matures{' '}
                        {formatDate(account.fd.maturityDate)} at {formatCurrency(account.fd.maturityValue)}
                      </p>
                      <p>
                        {account.fd.isMatured
                          ? '0 days left'
                          : `${account.fd.daysRemaining} days left`}
                      </p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(account.fd.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{account.transactionCount} transactions</p>
                  )}
                  {account.currentBalance < 0 && !isFd ? (
                    <p className="text-xs text-destructive">
                      This snapshot looks off. Set the real amount instead of chasing opening balance.
                    </p>
                  ) : null}
                  {!isFd ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setBalanceAccount(account)}
                    >
                      <Banknote className="size-4" />
                      {account.type === 'WALLET' ? 'I counted this cash' : 'Set what I have now'}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
              )
            })}
          </div>
          <PaginationControls meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
        onSubmit={handleSubmit}
        isLoading={createAccount.isPending || updateAccount.isPending}
      />
      <SetBalanceDialog
        open={Boolean(balanceAccount)}
        onOpenChange={(open) => {
          if (!open) setBalanceAccount(null)
        }}
        account={balanceAccount}
        onSubmit={handleSetBalance}
        isLoading={updateAccount.isPending}
      />
    </div>
  )
}
