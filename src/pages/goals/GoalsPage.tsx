import { useState } from 'react'
import { CheckCircle2, MoreHorizontal, Pencil, Plus, Target, Trash2 } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { GoalFormDialog } from '@/features/goals/components/GoalFormDialog'
import {
  useCompleteGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from '@/features/goals/hooks/useGoals'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import type { Goal } from '@/types/goal.types'
import { getErrorMessage } from '@/utils/errorUtils'

export default function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  const { data, isLoading, isError, error, refetch } = useGoals({ page: 1, limit: 50 })
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const completeGoal = useCompleteGoal()

  const handleSubmit = (values: { name: string; targetAmount: number; currentAmount?: number; targetDate?: string }) => {
    const payload = { ...values, targetDate: values.targetDate || undefined }
    if (editing) {
      updateGoal.mutate({ id: editing.id, payload }, {
        onSuccess: () => { toast.success('Goal updated'); setDialogOpen(false); setEditing(null) },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    } else {
      createGoal.mutate(payload, {
        onSuccess: () => { toast.success('Goal created'); setDialogOpen(false) },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Set financial goals and track your progress."
        action={<Button onClick={() => { setEditing(null); setDialogOpen(true) }}><Plus className="size-4" /> Add Goal</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState icon={Target} title="No goals yet" description="Create a savings goal to stay motivated." actionLabel="Add Goal" onAction={() => setDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((goal) => (
            <Card key={goal.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{goal.name}</CardTitle>
                  <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'secondary'} className="mt-1">
                    {goal.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {goal.status !== 'COMPLETED' ? (
                      <DropdownMenuItem onClick={() => completeGoal.mutate(goal.id, { onSuccess: () => toast.success('Goal completed!') })}>
                        <CheckCircle2 className="size-4" /> Mark Complete
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => { setEditing(goal); setDialogOpen(true) }}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => {
                      if (confirm('Delete this goal?')) deleteGoal.mutate(goal.id, { onSuccess: () => toast.success('Deleted') })
                    }}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <Progress value={Math.min(goal.progress, 100)} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPercent(goal.progress)} complete</span>
                  {goal.targetDate ? <span>Due {formatDate(goal.targetDate)}</span> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GoalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} goal={editing} onSubmit={handleSubmit} isLoading={createGoal.isPending || updateGoal.isPending} />
    </div>
  )
}
