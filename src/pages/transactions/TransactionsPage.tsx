import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Plus, Receipt, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { TransactionFormDialog } from '@/features/transactions/components/TransactionFormDialog'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions'
import { DEFAULT_PAGE_SIZE, TRANSACTION_TYPE_LABELS } from '@/constants/enums'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/transaction.types'
import type { TransactionType } from '@/types/enums'
import { getErrorMessage } from '@/utils/errorUtils'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useTransactions({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    orderBy: 'transactionDate',
    order: 'desc',
  })

  const { data: viewTransaction } = useTransaction(viewId ?? '')
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()

  const handleSubmit = (values: {
    title: string
    type: 'INCOME' | 'EXPENSE'
    amount: number
    transactionDate: string
    accountId: string
    categoryId?: string
    paymentMethod?: string
    notes?: string
    location?: string
  }) => {
    const payload = {
      ...values,
      categoryId: values.categoryId || undefined,
      paymentMethod: values.paymentMethod as Transaction['paymentMethod'],
      notes: values.notes || undefined,
      location: values.location || undefined,
    }

    if (editing) {
      updateTx.mutate({ id: editing.id, payload }, {
        onSuccess: () => { toast.success('Updated'); setDialogOpen(false); setEditing(null) },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    } else {
      createTx.mutate(payload, {
        onSuccess: () => { toast.success('Transaction added'); setDialogOpen(false) },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Track all your income and expenses."
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true) }}><Plus className="size-4" /> Add Transaction</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search transactions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as TransactionType | 'ALL'); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState icon={Receipt} title="No transactions" description="Add your first transaction to get started." actionLabel="Add Transaction" onAction={() => setDialogOpen(true)} />
      ) : (
        <>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.title}</TableCell>
                    <TableCell>{tx.category?.name ?? '—'}</TableCell>
                    <TableCell>{tx.account.name}</TableCell>
                    <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                    <TableCell><Badge variant={tx.type === 'INCOME' ? 'success' : 'secondary'}>{TRANSACTION_TYPE_LABELS[tx.type]}</Badge></TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : ''}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewId(tx.id)}><Eye className="size-4" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditing(tx); setDialogOpen(true) }}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => {
                            if (confirm('Delete this transaction?')) {
                              deleteTx.mutate(tx.id, { onSuccess: () => toast.success('Deleted'), onError: (err) => toast.error(getErrorMessage(err)) })
                            }
                          }}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
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

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} transaction={editing} onSubmit={handleSubmit} isLoading={createTx.isPending || updateTx.isPending} />

      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transaction Details</DialogTitle></DialogHeader>
          {viewTransaction ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Title</dt><dd className="font-medium">{viewTransaction.title}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatCurrency(viewTransaction.amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd>{TRANSACTION_TYPE_LABELS[viewTransaction.type]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Account</dt><dd>{viewTransaction.account.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd>{viewTransaction.category?.name ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd>{formatDate(viewTransaction.transactionDate)}</dd></div>
              {viewTransaction.notes ? <div><dt className="text-muted-foreground mb-1">Notes</dt><dd>{viewTransaction.notes}</dd></div> : null}
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
