import { cn } from '@/lib/utils'

interface DeltaLabelProps {
  value: number
  invert?: boolean
  suffix?: string
}

export function DeltaLabel({ value, invert = false, suffix = ' vs last period' }: DeltaLabelProps) {
  const positive = invert ? value <= 0 : value >= 0
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→'

  return (
    <span className={cn('text-xs font-medium', value === 0 ? 'text-muted-foreground' : positive ? 'text-emerald-600' : 'text-red-600')}>
      {arrow} {Math.abs(value).toFixed(1)}%{suffix}
    </span>
  )
}
