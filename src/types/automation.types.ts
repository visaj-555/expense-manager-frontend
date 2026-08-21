import type { PaginationParams, PaymentMethod, RecurringFrequency, TransactionType } from '@/types/enums'

export interface AutomationAccount {
  id: string
  name: string
  type: string
}

export interface AutomationCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export interface Automation {
  id: string
  userId: string
  title: string
  amount: number
  type: Exclude<TransactionType, 'TRANSFER'>
  paymentMethod: PaymentMethod
  frequency: RecurringFrequency
  startDate: string
  endDate: string | null
  lastProcessed: string | null
  nextRunDate: string
  isActive: boolean
  notes: string | null
  account: AutomationAccount
  category: AutomationCategory | null
  createdAt: string
  updatedAt: string
}

export interface CreateAutomationPayload {
  title: string
  amount: number
  accountId: string
  categoryId: string
  paymentMethod?: PaymentMethod
  type?: Exclude<TransactionType, 'TRANSFER'>
  frequency?: RecurringFrequency
  startDate: string
  endDate?: string
  notes?: string
}

export interface UpdateAutomationPayload {
  title?: string
  amount?: number
  accountId?: string
  categoryId?: string
  paymentMethod?: PaymentMethod
  frequency?: RecurringFrequency
  startDate?: string
  nextRunDate?: string
  endDate?: string | null
  notes?: string
  isActive?: boolean
}

export type AutomationQueryParams = PaginationParams
