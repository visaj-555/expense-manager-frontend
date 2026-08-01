import { useState } from 'react'
import { CreditCard, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/features/accounts/hooks/useAccounts'
import { ACCOUNT_TYPE_LABELS } from '@/constants/enums'
import { DEFAULT_PAGE_SIZE } from '@/constants/enums'
import { formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import { getErrorMessage } from '@/utils/errorUtils'

export default function AccountsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)

  const { data, isLoading, isError, error, refetch } = useAccounts({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    isArchived: false,
  })

  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const handleSubmit = (values: { name: string; type: Account['type']; currentBalance: number }) => {
    if (editing) {
      updateAccount.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            toast.success('Account updated')
            setDialogOpen(false)
            setEditing(null)
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      )
    } else {
      createAccount.mutate(values, {
        onSuccess: () => {
          toast.success('Account created')
          setDialogOpen(false)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    }
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
        description="Manage your bank and savings accounts."
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
          description="Create your first account to start tracking balances."
          actionLabel="Add Account"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((account) => (
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
                      <DropdownMenuItem onClick={() => { setEditing(account); setDialogOpen(true) }}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatCurrency(account.currentBalance)}</p>
                  <p className="text-xs text-muted-foreground">{account.transactionCount} transactions</p>
                </CardContent>
              </Card>
            ))}
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
    </div>
  )
}
