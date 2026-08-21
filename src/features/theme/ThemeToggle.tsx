import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/features/theme/ThemeProvider'
import type { Theme } from '@/features/theme/theme'

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolved, setTheme } = useTheme()

  if (compact) {
    const next: Theme = resolved === 'dark' ? 'light' : 'dark'
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setTheme(next)}
        aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {resolved === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors',
            theme === id
              ? 'border-primary bg-primary/5 text-foreground'
              : 'border-border text-muted-foreground hover:bg-muted/50',
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
