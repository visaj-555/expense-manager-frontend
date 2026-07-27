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
