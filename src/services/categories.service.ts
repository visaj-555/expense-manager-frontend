import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Category, CategoryQueryParams, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category.types'
import { axiosInstance } from '@/api/axiosInstance'
import { cleanParams } from '@/utils/cleanParams'

export const categoriesService = {
  getAll: async (params?: CategoryQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Category>>>('/categories', {
      params: cleanParams(params as Record<string, unknown>),
    })
    return data.data!
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`)
    return data.data!
  },

  create: async (payload: CreateCategoryPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Category>>('/categories', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateCategoryPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Category>>(`/categories/${id}`, payload)
    return data.data!
  },

  archive: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<Category>>(`/categories/${id}/archive`)
    return data.data!
  },

  restore: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<Category>>(`/categories/${id}/restore`)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/categories/${id}`)
  },
}
