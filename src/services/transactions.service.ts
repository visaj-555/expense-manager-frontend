import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionQueryParams,
  UpdateTransactionPayload,
} from '@/types/transaction.types'
import { axiosInstance } from '@/api/axiosInstance'

export const transactionsService = {
  getAll: async (params?: TransactionQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params })
    return data.data!
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return data.data!
  },

  create: async (payload: CreateTransactionPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Transaction>>('/transactions', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateTransactionPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Transaction>>(`/transactions/${id}`, payload)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/transactions/${id}`)
  },
}
