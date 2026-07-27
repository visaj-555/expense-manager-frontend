import type { CategoryType, PaginationParams, SortOrder } from '@/types/enums'

export interface Category {
  id: string
  userId: string
  name: string
  type: CategoryType
  icon: string | null
  color: string | null
  isArchived: boolean
  transactionCount: number
  createdAt: string
}

export interface CreateCategoryPayload {
  name: string
  type: CategoryType
  icon?: string
  color?: string
}

export interface UpdateCategoryPayload {
  name?: string
  type?: CategoryType
  icon?: string
  color?: string
}

export interface CategoryQueryParams extends PaginationParams {
  type?: CategoryType
  isArchived?: boolean
  search?: string
  orderBy?: 'name' | 'createdAt'
  order?: SortOrder
}
