import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { analyticsService } from '@/services/analytics.service'
import type { MonthlyAnalyticsParams, YearlyAnalyticsParams } from '@/types/analytics.types'

export function useMonthlyAnalytics(params?: MonthlyAnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.monthly(params?.month ?? new Date().getMonth() + 1, params?.year ?? new Date().getFullYear()),
    queryFn: () => analyticsService.getMonthlyCategoryAnalysis(params),
  })
}

export function useYearlyAnalytics(params?: YearlyAnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.yearly(params?.year ?? new Date().getFullYear()),
    queryFn: () => analyticsService.getYearlyCategoryAnalysis(params),
  })
}

export function useCashflowTrend() {
  return useQuery({
    queryKey: queryKeys.analytics.cashflow,
    queryFn: () => analyticsService.getCashflowTrend(),
  })
}

export function useTopExpenses() {
  return useQuery({
    queryKey: queryKeys.analytics.topExpenses,
    queryFn: () => analyticsService.getTopExpenses(),
  })
}

export function useCategoryTrend(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.categoryTrend(categoryId),
    queryFn: () => analyticsService.getCategoryTrend(categoryId),
    enabled: !!categoryId,
  })
}
