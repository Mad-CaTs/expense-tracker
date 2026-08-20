import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRecurring,
  deleteRecurring,
  getRecurring,
  toggleRecurring,
} from '@/lib/api/recurring'
import type { CreateRecurringPayload } from '@/types'

export function useRecurring(walletId?: number, options?: { requireWallet?: boolean }) {
  return useQuery({
    queryKey: ['recurring', walletId ?? null],
    queryFn: () => getRecurring(walletId),
    enabled: options?.requireWallet ? walletId != null : true,
  })
}

function useRecurringMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['recurring'] })
  }, [qc])
  return { ...mutation, refresh }
}

export const useCreateRecurring = () =>
  useRecurringMutation((data: CreateRecurringPayload) => createRecurring(data))

export const useToggleRecurring = () => useRecurringMutation(toggleRecurring)

export const useDeleteRecurring = () => useRecurringMutation(deleteRecurring)
