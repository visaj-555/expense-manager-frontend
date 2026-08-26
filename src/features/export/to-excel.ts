import * as XLSX from 'xlsx'
import type { ExportPayload } from '@/types/export.types'

function rowsSheet(rows: unknown[]) {
  const records = rows as Record<string, unknown>[]
  if (records.length === 0) {
    return XLSX.utils.aoa_to_sheet([['No rows in this range']])
  }
  return XLSX.utils.json_to_sheet(records)
}

export function toExcel(payload: ExportPayload) {
  const workbook = XLSX.utils.book_new()
  const overview = XLSX.utils.aoa_to_sheet([
    ['Expense Manager export'],
    ['Exported at', payload.exportedAt],
    ['Range', payload.period.range],
    ['Year', payload.period.year ?? ''],
    ['Month', payload.period.month ?? ''],
    ['From', payload.period.from ?? ''],
    ['To', payload.period.to ?? ''],
    [],
    ['Name', payload.user.name],
    ['Email', payload.user.email],
    ['Currency', payload.user.currencyCode],
    ['Timezone', payload.user.timezone],
    [],
    ['Accounts', payload.summary.accounts],
    ['Categories', payload.summary.categories],
    ['Transactions', payload.summary.transactions],
    ['Transfers', payload.summary.transfers],
    ['Goals', payload.summary.goals],
    ['Automations', payload.summary.automations],
  ])

  XLSX.utils.book_append_sheet(workbook, overview, 'Overview')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.accounts), 'Accounts')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.categories), 'Categories')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.transactions), 'Transactions')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.transfers), 'Transfers')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.goals), 'Goals')
  XLSX.utils.book_append_sheet(workbook, rowsSheet(payload.automations), 'Automations')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}
