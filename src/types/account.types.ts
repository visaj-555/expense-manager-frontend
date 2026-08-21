import type { AccountType, PaginationParams, SortOrder } from '@/types/enums'

export type FdCompounding = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface AccountFd {
  principal: number
  interestRate: number
  startDate: string
  tenureMonths: number
  compounding: FdCompounding
  maturityDate: string
  maturityValue: number
  accruedInterest: number
  daysElapsed: number
  daysRemaining: number
  totalDays: number
  isMatured: boolean
  progressPercent: number
}

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
  fd: AccountFd | null
}

export interface CreateAccountPayload {
  name: string
  type: AccountType
  currentBalance: number
  interestRate?: number
  startDate?: string
  tenureMonths?: number
  compounding?: FdCompounding
}

export interface UpdateAccountPayload {
  name?: string
  type?: AccountType
  currentBalance?: number
  isArchived?: boolean
  interestRate?: number
  startDate?: string
  tenureMonths?: number
  compounding?: FdCompounding
}

export interface AccountQueryParams extends PaginationParams {
  type?: AccountType
  isArchived?: boolean
  search?: string
  orderBy?: 'name' | 'createdAt' | 'updatedAt'
  order?: SortOrder
}

export type { AccountType }
