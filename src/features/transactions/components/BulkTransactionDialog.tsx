import { useMemo, useState, type ClipboardEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { parseBulkPaste } from '@/features/transactions/bulk-parse'
import { cn, formatCurrency, localISODate } from '@/lib/utils'
import type { Account } from '@/types/account.types'
import type { Category } from '@/types/category.types'
import type { CreateTransactionPayload } from '@/types/transaction.types'
import type { PaymentMethod } from '@/types/enums'

const NONE = '__none__'
const STARTER_ROWS = 6

interface BulkRow {
  key: string
  transactionDate: string
  title: string
  amount: string
  type: 'EXPENSE' | 'INCOME'
  categoryId: string
  accountId: string
  notes: string
}

interface BulkTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  categories: Category[]
  onSubmit: (payloads: CreateTransactionPayload[]) => void
  isLoading?: boolean
}

function nextKey() {
  return crypto.randomUUID()
}

function makeRow(defaults: { date: string; accountId: string; type: 'EXPENSE' | 'INCOME' }): BulkRow {
  return {
    key: nextKey(),
    transactionDate: defaults.date,
    title: '',
    amount: '',
    type: defaults.type,
    categoryId: NONE,
    accountId: defaults.accountId,
    notes: '',
  }
}

function matchCategory(categories: Category[], name: string | undefined, type: 'EXPENSE' | 'INCOME') {
  if (!name) return NONE
  const needle = name.trim().toLowerCase()
  const pool = categories.filter((category) => category.type === type)
  const exact = pool.find((category) => category.name.toLowerCase() === needle)
  if (exact) return exact.id
  const partial = pool.find((category) => category.name.toLowerCase().includes(needle))
  return partial?.id ?? NONE
}

export function BulkTransactionDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onSubmit,
  isLoading,
}: BulkTransactionDialogProps) {
  const spendAccounts = accounts.filter((account) => account.type !== 'FIXED_DEPOSIT')
  const defaultAccountId =
    spendAccounts.find((account) => account.type === 'WALLET')?.id ?? spendAccounts[0]?.id ?? ''

  const [defaultDate, setDefaultDate] = useState(localISODate)
  const [defaultType, setDefaultType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [defaultAccount, setDefaultAccount] = useState(defaultAccountId)
  const [rows, setRows] = useState<BulkRow[]>(() =>
    Array.from({ length: STARTER_ROWS }, () =>
      makeRow({ date: localISODate(), accountId: defaultAccountId, type: 'EXPENSE' }),
    ),
  )
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      const date = localISODate()
      setDefaultDate(date)
      setDefaultType('EXPENSE')
      setDefaultAccount(defaultAccountId)
      setRows(
        Array.from({ length: STARTER_ROWS }, () =>
          makeRow({ date, accountId: defaultAccountId, type: 'EXPENSE' }),
        ),
      )
    }
  }

  const readyRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.title.trim().length > 0 &&
          Number(row.amount) > 0 &&
          Boolean(row.accountId) &&
          Boolean(row.transactionDate),
      ),
    [rows],
  )

  const total = readyRows.reduce((sum, row) => sum + Number(row.amount), 0)

  const updateRow = (key: string, patch: Partial<BulkRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const addRow = () => {
    setRows((current) => [
      ...current,
      makeRow({ date: defaultDate, accountId: defaultAccount, type: defaultType }),
    ])
  }

  const removeRow = (key: string) => {
    setRows((current) =>
      current.length === 1
        ? current
        : current.filter((row) => row.key !== key),
    )
  }

  const applyPaste = (text: string, atKey?: string) => {
    const parsed = parseBulkPaste(text, defaultDate)
    if (parsed.length === 0) return false

    setRows((current) => {
      const incoming = parsed.map((item) => ({
        ...makeRow({ date: item.transactionDate, accountId: defaultAccount, type: defaultType }),
        title: item.title,
        amount: item.amount,
        transactionDate: item.transactionDate,
        notes: item.notes ?? '',
        categoryId: matchCategory(categories, item.categoryName, defaultType),
      }))

      const filled = current.filter((row) => row.title.trim() || Number(row.amount))
      const merged = atKey
        ? (() => {
            const index = current.findIndex((row) => row.key === atKey)
            if (index < 0) return [...filled, ...incoming]
            const next = [...current]
            next.splice(index, 1, ...incoming)
            return next
          })()
        : [...filled, ...incoming]

      const capped = merged.slice(0, 50)
      if (capped.length < 50) {
        capped.push(makeRow({ date: defaultDate, accountId: defaultAccount, type: defaultType }))
      }
      return capped
    })
    return true
  }

  const handlePaste = (event: ClipboardEvent, key?: string) => {
    const text = event.clipboardData.getData('text')
    if (!text.includes('\n') && !text.includes('\t')) return
    if (applyPaste(text, key)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleSubmit = () => {
    if (readyRows.length === 0 || !spendAccounts.length) return
    onSubmit(
      readyRows.map((row) => ({
        title: row.title.trim(),
        type: row.type,
        amount: Number(row.amount),
        transactionDate: row.transactionDate,
        accountId: row.accountId,
        categoryId: row.categoryId === NONE ? undefined : row.categoryId,
        paymentMethod: (row.accountId === spendAccounts.find((a) => a.type === 'WALLET')?.id
          ? 'CASH'
          : 'UPI') as PaymentMethod,
        notes: row.notes.trim() || undefined,
      })),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[min(96vw,1120px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        onPaste={(event) => handlePaste(event)}
      >
        <div className="border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle>Add bulk transactions</DialogTitle>
            <DialogDescription>
              Type down the list like a sheet. Paste from Excel or Notion (Date, Title, Amount, Category).
              Empty rows are ignored.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Default date
              <Input
                type="date"
                className="h-9 font-normal text-foreground"
                value={defaultDate}
                onChange={(event) => setDefaultDate(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Default account
              <Select value={defaultAccount} onValueChange={setDefaultAccount}>
                <SelectTrigger className="h-9 font-normal text-foreground">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {spendAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Default type
              <Select
                value={defaultType}
                onValueChange={(value) => setDefaultType(value as 'EXPENSE' | 'INCOME')}
              >
                <SelectTrigger className="h-9 font-normal text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <tr className="text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className="w-36 px-3 py-2">Date</th>
                <th className="px-3 py-2">Title</th>
                <th className="w-28 px-3 py-2">Amount</th>
                <th className="w-44 px-3 py-2">Category</th>
                <th className="w-40 px-3 py-2">Account</th>
                <th className="w-28 px-3 py-2">Type</th>
                <th className="w-40 px-3 py-2">Notes</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const typeCategories = categories.filter((category) => category.type === row.type)
                const ready =
                  row.title.trim().length > 0 && Number(row.amount) > 0 && Boolean(row.accountId)
                return (
                  <tr
                    key={row.key}
                    className={cn(
                      'border-t',
                      ready ? 'bg-emerald-500/5' : 'bg-background',
                    )}
                  >
                    <td className="px-2 py-1">
                      <Input
                        type="date"
                        className="h-8"
                        value={row.transactionDate}
                        onChange={(event) => updateRow(row.key, { transactionDate: event.target.value })}
                        onPaste={(event) => handlePaste(event, row.key)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        className="h-8"
                        placeholder={index === 0 ? 'e.g. PG rent' : ''}
                        value={row.title}
                        onChange={(event) => {
                          const title = event.target.value
                          setRows((current) => {
                            const next = current.map((item) =>
                              item.key === row.key ? { ...item, title } : item,
                            )
                            if (index === current.length - 1 && title.trim()) {
                              next.push(
                                makeRow({
                                  date: defaultDate,
                                  accountId: defaultAccount,
                                  type: defaultType,
                                }),
                              )
                            }
                            return next
                          })
                        }}
                        onPaste={(event) => handlePaste(event, row.key)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        className="h-8"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0"
                        value={row.amount}
                        onChange={(event) => updateRow(row.key, { amount: event.target.value })}
                        onPaste={(event) => handlePaste(event, row.key)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Select
                        value={row.categoryId}
                        onValueChange={(value) => updateRow(row.key, { categoryId: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>None</SelectItem>
                          {typeCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon ? `${category.icon} ` : ''}
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1">
                      <Select
                        value={row.accountId || undefined}
                        onValueChange={(value) => updateRow(row.key, { accountId: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {spendAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1">
                      <Select
                        value={row.type}
                        onValueChange={(value) =>
                          updateRow(row.key, {
                            type: value as 'EXPENSE' | 'INCOME',
                            categoryId: NONE,
                          })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="INCOME">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        className="h-8"
                        value={row.notes}
                        onChange={(event) => updateRow(row.key, { notes: event.target.value })}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length === 1}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="size-4" /> Add row
            </Button>
            <p className="text-muted-foreground">
              {readyRows.length} ready
              {readyRows.length > 0 ? ` · ${formatCurrency(total)}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || readyRows.length === 0 || spendAccounts.length === 0}
            >
              {isLoading
                ? 'Saving…'
                : `Save ${readyRows.length} transaction${readyRows.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
