export type AccountType = 'BANK' | 'SAVINGS' | 'WALLET'
export type CategoryType = 'EXPENSE' | 'INCOME'
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type PaymentMethod = 'CASH' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET'
export type GoalStatus = 'COMPLETED' | 'IN_PROGRESS'
export type SortOrder = 'asc' | 'desc'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
}
