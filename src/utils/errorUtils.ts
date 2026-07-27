import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api.types'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback

  const axiosError = error as AxiosError<ApiResponse<unknown>>
  const message = axiosError.response?.data?.message

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/

export const PASSWORD_HINT =
  '8–20 characters with uppercase, lowercase, number, and special character (@$!%*?&)'
