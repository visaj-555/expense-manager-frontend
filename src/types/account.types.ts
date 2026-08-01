import type { AccountType, PaginationParams, SortOrder } from '@/types/enums'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  isArchived: boolean
  createdAt: string
  updatedAt: string
  currentBalance: number
  transactionCount: number
}

export interface CreateAccountPayload {
  name: string
  type: AccountType
  currentBalance: number
}

export interface UpdateAccountPayload {
  name?: string
  type?: AccountType
  currentBalance?: number
  isArchived?: boolean
}

export interface AccountQueryParams extends PaginationParams {
  type?: AccountType
  isArchived?: boolean
  search?: string
  orderBy?: 'name' | 'createdAt' | 'updatedAt'
  order?: SortOrder
}

export type { AccountType }
