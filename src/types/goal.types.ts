import type { GoalStatus, PaginationParams, SortOrder } from '@/types/enums'

export interface Goal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  progress: number
  status: GoalStatus
  createdAt: string
}

export interface CreateGoalPayload {
  name: string
  targetAmount: number
  currentAmount?: number
  targetDate?: string
}

export type UpdateGoalPayload = Partial<CreateGoalPayload>

export interface GoalQueryParams extends PaginationParams {
  orderBy?: string
  order?: SortOrder
}
