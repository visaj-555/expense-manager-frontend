import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  CreateTransferPayload,
  Transfer,
  TransferQueryParams,
  UpdateTransferPayload,
} from '@/types/transfer.types'
import { axiosInstance } from '@/api/axiosInstance'
import { cleanParams } from '@/utils/cleanParams'

export const transfersService = {
  getAll: async (params?: TransferQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Transfer>>>('/transfers', {
      params: cleanParams(params as Record<string, unknown>),
    })
    return data.data!
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<Transfer>>(`/transfers/${id}`)
    return data.data!
  },

  create: async (payload: CreateTransferPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Transfer>>('/transfers', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateTransferPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Transfer>>(`/transfers/${id}`, payload)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/transfers/${id}`)
  },
}
