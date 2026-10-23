export interface CategoryAnalysisItem {
  category: string
  amount: number
  percentage: number
}

export interface CategoryAnalysis {
  totalExpense: number
  categories: CategoryAnalysisItem[]
}

export interface TrendAmount {
  month: string
  amount: number
}

export interface CashflowTrend {
  month: string
  income: number
  expense: number
}

export interface TopExpense {
  title: string
  amount: number
}

export interface MonthlyAnalyticsParams {
  month?: number
  year?: number
}

export interface YearlyAnalyticsParams {
  year?: number
}

export type AnalyticsPeriod = 'MONTHLY' | 'YEARLY'

export interface DeepInsightsParams {
  period?: AnalyticsPeriod
  month?: number
  year?: number
  categoryId?: string
}

export interface DeepCategoryShare {
  categoryId: string | null
  name: string
  icon: string | null
  color: string | null
  amount: number
  count: number
  avgAmount: number
  percentage: number
}

export interface DeepTrendPoint {
  key: string
  label: string
  income: number
  expense: number
  net: number
  savingsRate: number
}

export interface DeepDailyPoint {
  date: string
  day: number
  income: number
  expense: number
  net: number
}

export interface DeepWeekdayPoint {
  weekday: string
  amount: number
  count: number
}

export interface DeepAccountFlow {
  accountId: string
  name: string
  type: string
  outflow: number
  inflow: number
}

export interface DeepTopExpense {
  id: string
  title: string
  amount: number
  date: string
  category: string
  account: string
}

export interface DeepInsight {
  tone: 'positive' | 'warning' | 'neutral'
  text: string
}

export interface DeepInsights {
  period: {
    type: AnalyticsPeriod
    month: number | null
    year: number
    label: string
    start: string
    end: string
  }
  summary: {
    income: number
    expense: number
    net: number
    savingsRate: number
    transactionCount: number
    expenseCount: number
    incomeCount: number
    avgDailySpend: number
    avgExpense: number
    incomeChangePct: number
    expenseChangePct: number
    netChangePct: number
    largestExpense: {
      id: string
      title: string
      amount: number
      date: string
      category: string
    } | null
  }
  previous: {
    income: number
    expense: number
    net: number
  }
  categories: DeepCategoryShare[]
  incomeSources: DeepCategoryShare[]
  trend: DeepTrendPoint[]
  daily: DeepDailyPoint[]
  weekday: DeepWeekdayPoint[]
  accounts: DeepAccountFlow[]
  topExpenses: DeepTopExpense[]
  transfers: {
    count: number
    amount: number
  }
  insights: DeepInsight[]
}
