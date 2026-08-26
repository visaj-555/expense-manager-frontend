import { useMutation } from '@tanstack/react-query'
import { downloadBlob, exportFilename } from '@/features/export/download-file'
import { toExcel } from '@/features/export/to-excel'
import { exportService } from '@/services/export.service'
import type { ExportRequest } from '@/types/export.types'

const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function useExportData() {
  return useMutation({
    mutationFn: async ({ format, ...params }: ExportRequest) => {
      const payload = await exportService.get(params)
      const filename = exportFilename(params.range ?? 'all', format, params.year, params.month)
      const blob =
        format === 'excel'
          ? new Blob([toExcel(payload)], { type: EXCEL_MIME })
          : new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
      downloadBlob(filename, blob)
      return payload
    },
  })
}
