export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_KEY = 'em.theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_KEY)
  return isTheme(stored) ? stored : 'system'
}

export function resolveTheme(theme: Theme, prefersDark?: boolean): ResolvedTheme {
  if (theme === 'light' || theme === 'dark') return theme
  const dark =
    prefersDark ??
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  return dark ? 'dark' : 'light'
}

export function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}
