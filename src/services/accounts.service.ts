import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Account, AccountQueryParams, CreateAccountPayload, UpdateAccountPayload } from '@/types/account.types'
import { axiosInstance } from '@/api/axiosInstance'
import { cleanParams } from '@/utils/cleanParams'

export const accountsService = {
  getAll: async (params?: AccountQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Account>>>('/accounts', {
      params: cleanParams(params as Record<string, unknown>),
    })
    return data.data!
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<Account>>(`/accounts/${id}`)
    return data.data!
  },

  create: async (payload: CreateAccountPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Account>>('/accounts', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateAccountPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Account>>(`/accounts/${id}`, payload)
    return data.data!
  },

  archive: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<Account>>(`/accounts/${id}/archive`)
    return data.data!
  },

  restore: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<Account>>(`/accounts/${id}/restore`)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/accounts/${id}`)
  },
}
