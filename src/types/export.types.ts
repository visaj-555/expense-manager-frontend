export type ExportRange = 'all' | 'year' | 'month'
export type ExportFormat = 'json' | 'excel'

export interface ExportQueryParams {
  range?: ExportRange
  year?: number
  month?: number
}

export interface ExportRequest extends ExportQueryParams {
  format: ExportFormat
}

export interface ExportPeriod {
  range: ExportRange
  year?: number
  month?: number
  from?: string | null
  to?: string | null
}

export interface ExportSummary {
  accounts: number
  categories: number
  transactions: number
  transfers: number
  goals: number
  automations: number
}

export interface ExportPayload {
  exportedAt: string
  period: ExportPeriod
  summary: ExportSummary
  user: {
    name: string
    email: string
    currencyCode: string
    timezone: string
    createdAt: string | null
  }
  accounts: unknown[]
  categories: unknown[]
  transactions: unknown[]
  transfers: unknown[]
  goals: unknown[]
  automations: unknown[]
}
