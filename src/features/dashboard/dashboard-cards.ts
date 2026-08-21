export const DASHBOARD_CARD_IDS = [
  'currentBalance',
  'cash',
  'fd',
  'monthlyIncome',
  'monthlyExpense',
  'monthlySavings',
  'netCashFlow',
  'investments',
  'spendingTrend',
  'accountDistribution',
  'topCategories',
  'goals',
  'recentTransactions',
  'insights',
] as const

export type DashboardCardId = (typeof DASHBOARD_CARD_IDS)[number]

export interface DashboardCardMeta {
  id: DashboardCardId
  label: string
  hint: string
  group: 'numbers' | 'sections'
}

export const DASHBOARD_CARDS: DashboardCardMeta[] = [
  { id: 'currentBalance', label: 'Current Balance', hint: 'Bank accounts', group: 'numbers' },
  { id: 'cash', label: 'Current Cash', hint: 'Cash in hand', group: 'numbers' },
  { id: 'fd', label: 'Fixed Deposits', hint: 'Live FD value', group: 'numbers' },
  { id: 'monthlyIncome', label: 'Monthly Income', hint: 'This month in', group: 'numbers' },
  { id: 'monthlyExpense', label: 'Monthly Expenses', hint: 'This month out', group: 'numbers' },
  { id: 'monthlySavings', label: 'Monthly Savings', hint: 'Transfers to savings', group: 'numbers' },
  { id: 'netCashFlow', label: 'Net Cash Flow', hint: 'Income minus expenses', group: 'numbers' },
  { id: 'investments', label: 'Investments', hint: 'SIP total', group: 'numbers' },
  { id: 'spendingTrend', label: 'Spending Trend', hint: 'Chart', group: 'sections' },
  { id: 'accountDistribution', label: 'Account Distribution', hint: 'Chart', group: 'sections' },
  { id: 'topCategories', label: 'Top Categories', hint: 'Chart', group: 'sections' },
  { id: 'goals', label: 'Goal Progress', hint: 'List', group: 'sections' },
  { id: 'recentTransactions', label: 'Recent Transactions', hint: 'List', group: 'sections' },
  { id: 'insights', label: 'Quick Insights', hint: 'Tips', group: 'sections' },
]

export type DashboardCardVisibility = Record<DashboardCardId, boolean>

export const DEFAULT_DASHBOARD_CARDS: DashboardCardVisibility = {
  currentBalance: true,
  cash: true,
  fd: true,
  monthlyIncome: true,
  monthlyExpense: true,
  monthlySavings: true,
  netCashFlow: true,
  investments: true,
  spendingTrend: true,
  accountDistribution: true,
  topCategories: true,
  goals: true,
  recentTransactions: true,
  insights: true,
}

export const DASHBOARD_CARDS_STORAGE_KEY = 'em.dashboardCards'
