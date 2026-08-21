import { useState } from 'react'
import { MoreHorizontal, Pause, Pencil, Play, Plus, Repeat, Trash2, Zap } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { FREQUENCY_LABELS, PAYMENT_METHOD_LABELS } from '@/constants/enums'
import { AutomationFormDialog, type AutomationFormValues } from '@/features/automations/components/AutomationFormDialog'
import {
  useAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useRunAutomation,
  useUpdateAutomation,
} from '@/features/automations/hooks/useAutomations'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Automation } from '@/types/automation.types'
import { getErrorMessage } from '@/utils/errorUtils'

export default function AutomatePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Automation | null>(null)

  const { data, isLoading, isError, error, refetch } = useAutomations({ page: 1, limit: 50 })
  const { data: accountsData } = useAccounts({ page: 1, limit: 100, isArchived: false })
  const { data: categoriesData } = useCategories({ page: 1, limit: 100, isArchived: false })

  const accounts = accountsData?.data ?? []
  const categories = categoriesData?.data ?? []

  const createAutomation = useCreateAutomation()
  const updateAutomation = useUpdateAutomation()
  const deleteAutomation = useDeleteAutomation()
  const runAutomation = useRunAutomation()

  const handleSubmit = (values: AutomationFormValues) => {
    if (editing) {
      updateAutomation.mutate(
        {
          id: editing.id,
          payload: {
            title: values.title,
            amount: values.amount,
            accountId: values.accountId,
            categoryId: values.categoryId,
            paymentMethod: values.paymentMethod,
            frequency: values.frequency,
            nextRunDate: values.startDate,
          },
        },
        {
          onSuccess: () => {
            toast.success('Automation updated')
            setDialogOpen(false)
            setEditing(null)
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      )
      return
    }

    createAutomation.mutate(
      {
        title: values.title,
        amount: values.amount,
        accountId: values.accountId,
        categoryId: values.categoryId,
        paymentMethod: values.paymentMethod,
        frequency: values.frequency,
        startDate: values.startDate,
        type: 'EXPENSE',
      },
      {
        onSuccess: () => {
          toast.success('Automation started')
          setDialogOpen(false)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automate"
        description="Schedule UPI deductions into SIP or any other category. Change the amount whenever you need."
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add automation
          </Button>
        }
      />

      <Alert>
        <AlertDescription>
          On the deduction date we post a UPI expense to the category you chose. Opening this page or the dashboard
          also catches up any missed dates without rewriting today&apos;s cash snapshot.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Repeat}
          title="No automations yet"
          description="Add a monthly SIP, rent, or any repeating UPI debit."
          actionLabel="Add automation"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((automation) => (
            <Card key={automation.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{automation.title}</CardTitle>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant={automation.isActive ? 'success' : 'secondary'}>
                      {automation.isActive ? 'Active' : 'Paused'}
                    </Badge>
                    <Badge variant="outline">{PAYMENT_METHOD_LABELS[automation.paymentMethod]}</Badge>
                    <Badge variant="outline">{FREQUENCY_LABELS[automation.frequency]}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(automation)
                        setDialogOpen(true)
                      }}
                    >
                      <Pencil className="size-4" /> Update amount / date
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        runAutomation.mutate(automation.id, {
                          onSuccess: () => toast.success('Due deduction posted'),
                          onError: (err) => toast.error(getErrorMessage(err)),
                        })
                      }
                    >
                      <Zap className="size-4" /> Post if due
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateAutomation.mutate(
                          { id: automation.id, payload: { isActive: !automation.isActive } },
                          {
                            onSuccess: () =>
                              toast.success(automation.isActive ? 'Paused' : 'Resumed'),
                            onError: (err) => toast.error(getErrorMessage(err)),
                          },
                        )
                      }
                    >
                      {automation.isActive ? <Pause className="size-4" /> : <Play className="size-4" />}
                      {automation.isActive ? 'Pause' : 'Resume'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (!confirm(`Delete "${automation.title}"?`)) return
                        deleteAutomation.mutate(automation.id, {
                          onSuccess: () => toast.success('Deleted'),
                          onError: (err) => toast.error(getErrorMessage(err)),
                        })
                      }}
                    >
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-semibold">{formatCurrency(automation.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {automation.account.name} → {automation.category?.name ?? 'Uncategorised'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Next deduction {formatDate(automation.nextRunDate)}
                  {automation.lastProcessed ? ` · Last posted ${formatDate(automation.lastProcessed)}` : ''}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEditing(automation)
                    setDialogOpen(true)
                  }}
                >
                  <Pencil className="size-4" />
                  Change amount
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AutomationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        automation={editing}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={createAutomation.isPending || updateAutomation.isPending}
      />
    </div>
  )
}
