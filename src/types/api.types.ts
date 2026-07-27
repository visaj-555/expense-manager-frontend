export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data?: T
  meta?: Record<string, unknown>
  error?: {
    code?: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
