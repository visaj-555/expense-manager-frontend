import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Automation,
  AutomationQueryParams,
  CreateAutomationPayload,
  UpdateAutomationPayload,
} from '@/types/automation.types'
import { axiosInstance } from '@/api/axiosInstance'
import { cleanParams } from '@/utils/cleanParams'

export const automationsService = {
  getAll: async (params?: AutomationQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Automation>>>('/automations', {
      params: cleanParams(params as Record<string, unknown>),
    })
    return data.data!
  },

  create: async (payload: CreateAutomationPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Automation>>('/automations', payload)
    return data.data!
  },

  update: async (id: string, payload: UpdateAutomationPayload) => {
    const { data } = await axiosInstance.patch<ApiResponse<Automation>>(`/automations/${id}`, payload)
    return data.data!
  },

  runDue: async (id: string) => {
    const { data } = await axiosInstance.post<ApiResponse<Automation>>(`/automations/${id}/run`)
    return data.data!
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/automations/${id}`)
  },
}
