import type { ApiResponse } from '@/types/api.types'
import type { DashboardData } from '@/types/dashboard.types'
import { axiosInstance } from '@/api/axiosInstance'

export const dashboardService = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardData>>('/dashboard')
    return data.data!
  },
}
