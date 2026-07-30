import type { PaginationParams, PaymentMethod, SortOrder, TransactionType } from '@/types/enums'

export interface TransactionAccount {
  id: string
  name: string
  type: string
}

export interface TransactionCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export interface Transaction {
  id: string
  userId: string
  title: string
  type: TransactionType
  amount: number
  transactionDate: string
  paymentMethod: PaymentMethod | null
  notes: string | null
  location: string | null
  account: TransactionAccount
  category: TransactionCategory | null
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionPayload {
  title: string
  type: Exclude<TransactionType, 'TRANSFER'>
  amount: number
  transactionDate: string
  accountId: string
  categoryId?: string
  paymentMethod?: PaymentMethod
  notes?: string
  location?: string
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>

export interface TransactionQueryParams extends PaginationParams {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
  search?: string
  minAmount?: number
  maxAmount?: number
  orderBy?: 'transactionDate' | 'amount' | 'createdAt'
  order?: SortOrder
}
