import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { transfersService } from '@/services/transfers.service'
import type {
  CreateTransferPayload,
  TransferQueryParams,
  UpdateTransferPayload,
} from '@/types/transfer.types'

function invalidateTransferQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
}

export function useTransfers(params?: TransferQueryParams) {
  return useQuery({
    queryKey: queryKeys.transfers.list(params),
    queryFn: () => transfersService.getAll(params),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => transfersService.create(payload),
    onSuccess: () => invalidateTransferQueries(queryClient),
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransferPayload }) =>
      transfersService.update(id, payload),
    onSuccess: () => invalidateTransferQueries(queryClient),
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transfersService.delete(id),
    onSuccess: () => invalidateTransferQueries(queryClient),
  })
}
