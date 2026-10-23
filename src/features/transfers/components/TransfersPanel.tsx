import { useState } from 'react'
import { ArrowRight, ArrowRightLeft, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { ACCOUNT_TYPE_LABELS, DEFAULT_PAGE_SIZE } from '@/constants/enums'
import { TransferFormDialog, type TransferFormValues } from '@/features/transfers/components/TransferFormDialog'
import {
  useCreateTransfer,
  useDeleteTransfer,
  useTransfers,
  useUpdateTransfer,
} from '@/features/transfers/hooks/useTransfers'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import type { AccountType } from '@/types/enums'
import type { Transfer } from '@/types/transfer.types'
import { getErrorMessage } from '@/utils/errorUtils'

interface TransfersPanelProps {
  accounts: Account[]
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
}

function accountTypeLabel(type?: string) {
  if (!type) return ''
  return ACCOUNT_TYPE_LABELS[type as AccountType] ?? type
}

const ALL_VALUE = '__all__'

export function TransfersPanel({ accounts, dialogOpen, onDialogOpenChange }: TransfersPanelProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [fromAccountId, setFromAccountId] = useState(ALL_VALUE)
  const [toAccountId, setToAccountId] = useState(ALL_VALUE)
  const [editing, setEditing] = useState<Transfer | null>(null)

  const { data, isLoading, isError, error, refetch } = useTransfers({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    fromAccountId: fromAccountId === ALL_VALUE ? undefined : fromAccountId,
    toAccountId: toAccountId === ALL_VALUE ? undefined : toAccountId,
    orderBy: 'transferDate',
    order: 'desc',
  })
  const createTransfer = useCreateTransfer()
  const updateTransfer = useUpdateTransfer()
  const deleteTransfer = useDeleteTransfer()

  const closeDialog = () => {
    onDialogOpenChange(false)
    setEditing(null)
  }

  const handleSubmit = (values: TransferFormValues) => {
    const payload = {
      fromAccountId: values.fromAccountId,
      toAccountId: values.toAccountId,
      amount: values.amount,
      transferDate: values.transferDate,
      note: values.note?.trim() || undefined,
    }

    if (editing) {
      updateTransfer.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            toast.success('Transfer updated')
            closeDialog()
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      )
      return
    }

    createTransfer.mutate(payload, {
      onSuccess: () => {
        toast.success('Money moved between accounts')
        closeDialog()
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Select
          value={fromAccountId}
          onValueChange={(value) => {
            setFromAccountId(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="From account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All from accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={toAccountId}
          onValueChange={(value) => {
            setToAccountId(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="To account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All to accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No transfers yet"
          description="Move money from one account to another — bank, cash, or savings."
          actionLabel="Transfer money"
          onAction={() => {
            setEditing(null)
            onDialogOpenChange(true)
          }}
        />
      ) : (
        <>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moved from</TableHead>
                  <TableHead className="w-10" />
                  <TableHead>Moved to</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.fromAccount.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {accountTypeLabel(row.fromAccount.type)} · deducted
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ArrowRight className="size-4" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{row.toAccount.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {accountTypeLabel(row.toAccount.type)} · added
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(row.transferDate)}</TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground">
                      {row.note || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-semibold">{formatCurrency(row.amount)}</p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(row)
                              onDialogOpenChange(true)
                            }}
                          >
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (!confirm('Delete this transfer? Both account balances will reverse.')) return
                              deleteTransfer.mutate(row.id, {
                                onSuccess: () => toast.success('Transfer deleted'),
                                onError: (err) => toast.error(getErrorMessage(err)),
                              })
                            }}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <TransferFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          onDialogOpenChange(open)
          if (!open) setEditing(null)
        }}
        accounts={accounts}
        transfer={editing}
        onSubmit={handleSubmit}
        isLoading={createTransfer.isPending || updateTransfer.isPending}
      />
    </div>
  )
}

export function TransferActionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      <Plus className="size-4" />
      Transfer money
    </Button>
  )
}
