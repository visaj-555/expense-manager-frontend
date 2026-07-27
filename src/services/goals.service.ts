import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { CreateGoalPayload, Goal, GoalQueryParams, UpdateGoalPayload } from '@/types/goal.types'
import { axiosInstance } from '@/api/axiosInstance'

export const goalsService = {
  getAll: async (params?: GoalQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Goal>>>('/goals', { params })
    return data.data!
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<Goal>>(`/goals/${id}`)
    return data.data!
  },

  create: async (payload: CreateGoalPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Goal>>('/goals', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateGoalPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Goal>>(`/goals/${id}`, payload)
    return data.data!
  },

  complete: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<Goal>>(`/goals/${id}/complete`)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/goals/${id}`)
  },
}
