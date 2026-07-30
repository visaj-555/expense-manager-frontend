import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Target,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/auth/useLogout'
import { useAppSelector } from '@/store/hooks'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: CreditCard },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const user = useAppSelector((state) => state.auth.user)
  const logout = useLogout()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-18' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="size-5" />
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Expense Manager</p>
            <p className="truncate text-xs text-muted-foreground">Personal Finance</p>
          </div>
        ) : null}
        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onToggle}>
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2',
              )
            }
          >
            <Icon className="size-4.5 shrink-0" />
            {!collapsed ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user ? (
          <div className="mb-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        ) : null}
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3 text-muted-foreground hover:text-destructive', collapsed && 'justify-center px-2')}
          onClick={logout}
        >
          <LogOut className="size-4.5" />
          {!collapsed ? 'Logout' : null}
        </Button>
      </div>
    </aside>
  )
}
