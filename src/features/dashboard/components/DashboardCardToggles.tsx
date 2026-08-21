import { DASHBOARD_CARDS } from '@/features/dashboard/dashboard-cards'
import type { DashboardCardId, DashboardCardVisibility } from '@/features/dashboard/dashboard-cards'
import { Switch } from '@/components/ui/switch'

interface DashboardCardTogglesProps {
  visibility: DashboardCardVisibility
  onToggle: (id: DashboardCardId, visible: boolean) => void
}

export function DashboardCardToggles({ visibility, onToggle }: DashboardCardTogglesProps) {
  const numbers = DASHBOARD_CARDS.filter((card) => card.group === 'numbers')
  const sections = DASHBOARD_CARDS.filter((card) => card.group === 'sections')

  return (
    <div className="space-y-6">
      <ToggleGroup title="Number cards" cards={numbers} visibility={visibility} onToggle={onToggle} />
      <ToggleGroup title="Charts and lists" cards={sections} visibility={visibility} onToggle={onToggle} />
    </div>
  )
}

function ToggleGroup({
  title,
  cards,
  visibility,
  onToggle,
}: {
  title: string
  cards: typeof DASHBOARD_CARDS
  visibility: DashboardCardVisibility
  onToggle: (id: DashboardCardId, visible: boolean) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      <ul className="divide-y rounded-lg border">
        {cards.map((card) => (
          <li key={card.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </div>
            <Switch
              checked={visibility[card.id]}
              onCheckedChange={(checked) => onToggle(card.id, checked)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
