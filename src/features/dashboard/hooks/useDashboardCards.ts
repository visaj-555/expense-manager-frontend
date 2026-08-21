import { useCallback, useMemo, useState } from 'react'
import {
  DASHBOARD_CARDS_STORAGE_KEY,
  DASHBOARD_CARD_IDS,
  DEFAULT_DASHBOARD_CARDS,
  type DashboardCardId,
  type DashboardCardVisibility,
} from '@/features/dashboard/dashboard-cards'

function readStored(): DashboardCardVisibility {
  try {
    const raw = localStorage.getItem(DASHBOARD_CARDS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DASHBOARD_CARDS }
    const parsed = JSON.parse(raw) as Partial<DashboardCardVisibility>
    return {
      ...DEFAULT_DASHBOARD_CARDS,
      ...parsed,
    }
  } catch {
    return { ...DEFAULT_DASHBOARD_CARDS }
  }
}

function persist(next: DashboardCardVisibility) {
  localStorage.setItem(DASHBOARD_CARDS_STORAGE_KEY, JSON.stringify(next))
}

export function useDashboardCards() {
  const [visibility, setVisibility] = useState<DashboardCardVisibility>(readStored)

  const setCard = useCallback((id: DashboardCardId, visible: boolean) => {
    setVisibility((current) => {
      const enabledCount = DASHBOARD_CARD_IDS.filter((cardId) =>
        cardId === id ? visible : current[cardId],
      ).length
      if (!visible && enabledCount === 0) return current

      const next = { ...current, [id]: visible }
      persist(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = { ...DEFAULT_DASHBOARD_CARDS }
    persist(next)
    setVisibility(next)
  }, [])

  const enabledCount = useMemo(
    () => DASHBOARD_CARD_IDS.filter((id) => visibility[id]).length,
    [visibility],
  )

  return { visibility, setCard, reset, enabledCount }
}
