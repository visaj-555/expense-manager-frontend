import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon?: LucideIcon
  trend?: { value: string; positive?: boolean }
  className?: string
  onClick?: () => void
}

export function StatCard({ title, value, description, icon: Icon, trend, className, onClick }: StatCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'rounded-xl border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          {trend ? (
            <p className={cn('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              {trend.value}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
