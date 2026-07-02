import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRecurring,
  deleteRecurring,
  getRecurring,
  toggleRecurring,
} from '@/lib/api/recurring'
import type { CreateRecurringPayload } from '@/types'

export function useRecurring(walletId?: number) {
  return useQuery({ queryKey: ['recurring', walletId ?? null], queryFn: () => getRecurring(walletId) })
}

export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRecurringPayload) => createRecurring(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useToggleRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}
