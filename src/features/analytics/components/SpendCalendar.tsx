import { formatCurrency } from '@/lib/utils'
import type { DeepDailyPoint } from '@/types/analytics.types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface SpendCalendarProps {
  daily: DeepDailyPoint[]
}

export function SpendCalendar({ daily }: SpendCalendarProps) {
  if (!daily.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Daily view is available for a month</p>
  }

  const max = Math.max(...daily.map((day) => day.expense), 1)
  const firstWeekday = new Date(`${daily[0].date}T00:00:00.000Z`).getUTCDay()
  const blanks = Array.from({ length: firstWeekday })

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {daily.map((day) => {
          const intensity = day.expense / max
          return (
            <div
              key={day.date}
              title={`${day.date}: ${formatCurrency(day.expense)} spent`}
              className="flex aspect-square flex-col items-center justify-center rounded-md text-[10px] font-medium"
              style={{
                background:
                  day.expense <= 0
                    ? 'var(--muted)'
                    : `color-mix(in oklab, var(--chart-6) ${Math.round(28 + intensity * 72)}%, transparent)`,
                color: intensity > 0.55 ? 'white' : 'var(--foreground)',
              }}
            >
              <span>{day.day}</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">Darker days are higher spend. Hover a cell for the amount.</p>
    </div>
  )
}
