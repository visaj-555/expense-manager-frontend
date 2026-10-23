import { cn } from '@/lib/utils'
import type { DeepInsight } from '@/types/analytics.types'

interface InsightPillsProps {
  insights: DeepInsight[]
}

export function InsightPills({ insights }: InsightPillsProps) {
  if (!insights.length) return null

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight) => (
        <div
          key={insight.text}
          className={cn(
            'rounded-xl border px-4 py-3 text-sm leading-relaxed',
            insight.tone === 'positive' &&
              'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
            insight.tone === 'warning' &&
              'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
            insight.tone === 'neutral' && 'bg-card text-foreground',
          )}
        >
          {insight.text}
        </div>
      ))}
    </div>
  )
}
