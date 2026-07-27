import type { ApiResponse } from '@/types/api.types'
import type {
  CashflowTrend,
  CategoryAnalysis,
  MonthlyAnalyticsParams,
  TopExpense,
  TrendAmount,
  YearlyAnalyticsParams,
} from '@/types/analytics.types'
import { axiosInstance } from '@/api/axiosInstance'

export const analyticsService = {
  getMonthlyCategoryAnalysis: async (params?: MonthlyAnalyticsParams) => {
    const { data } = await axiosInstance.get<ApiResponse<CategoryAnalysis>>('/analytics/monthly-category-analysis', {
      params,
    })
    return data.data!
  },

  getYearlyCategoryAnalysis: async (params?: YearlyAnalyticsParams) => {
    const { data } = await axiosInstance.get<ApiResponse<CategoryAnalysis>>('/analytics/yearly-category-analysis', {
      params,
    })
    return data.data!
  },

  getCategoryTrend: async (categoryId: string) => {
    const { data } = await axiosInstance.get<ApiResponse<TrendAmount[]>>(`/analytics/category-trend/${categoryId}`)
    return data.data!
  },

  getCashflowTrend: async () => {
    const { data } = await axiosInstance.get<ApiResponse<CashflowTrend[]>>('/analytics/cashflow-trend')
    return data.data!
  },

  getTopExpenses: async () => {
    const { data } = await axiosInstance.get<ApiResponse<TopExpense[]>>('/analytics/top-expenses')
    return data.data!
  },
}
