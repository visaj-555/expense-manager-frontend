import { CHART_COLORS } from '@/constants/enums'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { DeepCategoryShare } from '@/types/analytics.types'

interface CategoryShareListProps {
  categories: DeepCategoryShare[]
  selectedId?: string
  onSelect?: (categoryId: string | null) => void
}

export function CategoryShareList({ categories, selectedId, onSelect }: CategoryShareListProps) {
  if (!categories.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No category spend in this period</p>
  }

  return (
    <div className="space-y-3">
      {categories.map((category, index) => {
        const active = selectedId === (category.categoryId ?? '')
        return (
          <button
            key={category.categoryId ?? category.name}
            type="button"
            onClick={() => onSelect?.(active ? null : category.categoryId)}
            className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            style={active ? { borderColor: 'var(--primary)' } : undefined}
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: category.color || CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="truncate">
                  {category.icon ? `${category.icon} ` : ''}
                  {category.name}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold">{formatCurrency(category.amount)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, category.percentage)}%`,
                  background: category.color || CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatPercent(category.percentage)} · {category.count} txn · avg {formatCurrency(category.avgAmount)}
            </p>
          </button>
        )
      })}
    </div>
  )
}
