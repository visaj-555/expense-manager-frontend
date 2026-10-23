import type { PaginationParams, SortOrder } from '@/types/enums'

export interface TransferAccount {
  id: string
  name: string
  type?: string
}

export interface Transfer {
  id: string
  userId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  note: string | null
  transferDate: string
  createdAt: string
  fromAccount: TransferAccount
  toAccount: TransferAccount
}

export interface CreateTransferPayload {
  fromAccountId: string
  toAccountId: string
  amount: number
  transferDate: string
  note?: string
}

export type UpdateTransferPayload = Partial<CreateTransferPayload>

export interface TransferQueryParams extends PaginationParams {
  fromAccountId?: string
  toAccountId?: string
  search?: string
  startDate?: string
  endDate?: string
  orderBy?: 'transferDate' | 'amount' | 'createdAt'
  order?: SortOrder
}
