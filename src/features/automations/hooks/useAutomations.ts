import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { automationsService } from '@/services/automations.service'
import type {
  AutomationQueryParams,
  CreateAutomationPayload,
  UpdateAutomationPayload,
} from '@/types/automation.types'

function invalidateAutomations(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.automations.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
}

export function useAutomations(params?: AutomationQueryParams) {
  return useQuery({
    queryKey: queryKeys.automations.list(params),
    queryFn: () => automationsService.getAll(params),
  })
}

export function useCreateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAutomationPayload) => automationsService.create(payload),
    onSuccess: () => invalidateAutomations(queryClient),
  })
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAutomationPayload }) =>
      automationsService.update(id, payload),
    onSuccess: () => invalidateAutomations(queryClient),
  })
}

export function useRunAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationsService.runDue(id),
    onSuccess: () => invalidateAutomations(queryClient),
  })
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationsService.delete(id),
    onSuccess: () => invalidateAutomations(queryClient),
  })
}
