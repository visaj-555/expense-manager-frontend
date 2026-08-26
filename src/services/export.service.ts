import type { ApiResponse } from '@/types/api.types'
import type { ExportPayload, ExportQueryParams } from '@/types/export.types'
import { axiosInstance } from '@/api/axiosInstance'
import { cleanParams } from '@/utils/cleanParams'

export const exportService = {
  get: async (params: ExportQueryParams) => {
    const { data } = await axiosInstance.get<ApiResponse<ExportPayload>>('/export', {
      params: cleanParams(params as Record<string, unknown>),
    })
    return data.data!
  },
}
