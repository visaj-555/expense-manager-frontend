import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  THEME_KEY,
  type ResolvedTheme,
  type Theme,
} from '@/features/theme/theme'

interface ThemeContextValue {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const resolved = resolveTheme(theme, systemPrefersDark)

  useEffect(() => {
    applyTheme(resolved)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme, resolved])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemPrefersDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
