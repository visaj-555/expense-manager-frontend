export interface DashboardOverview {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlySavings: number
  monthlyInvestments: number
  netCashFlow: number
  savingsRate: number
}

export interface DashboardAccountDistribution {
  account: string
  balance: number
}

export interface DashboardTopCategory {
  category: string
  amount: number
}

export interface DashboardRecentTransaction {
  title: string
  amount: number
  type: string
  category: string
  transactionDate: string
}

export interface DashboardGoalProgress {
  goalName: string
  targetAmount: number
  currentAmount: number
  progress: number
}

export interface DashboardBudgetSummary {
  category: string
  budget: number
  spent: number
  remaining: number
  percentageUsed: number
}

export interface DashboardSpendingTrend {
  month: string
  expense: number
}

export interface DashboardData {
  overview: DashboardOverview
  accountDistribution: DashboardAccountDistribution[]
  monthlySummary: {
    topCategories: DashboardTopCategory[]
  }
  recentTransactions: DashboardRecentTransaction[]
  goalsProgress: DashboardGoalProgress[]
  budgetSummary: DashboardBudgetSummary[]
  spendingTrend: DashboardSpendingTrend[]
  insights: string[]
}
