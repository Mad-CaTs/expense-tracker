import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  confirmOccurrence,
  getPendingOccurrences,
  payOccurrenceDebt,
  rejectOccurrence,
} from '@/lib/api/recurringOccurrences'

export function usePendingOccurrences() {
  return useQuery({
    queryKey: ['recurring', 'occurrences', 'pending'],
    queryFn: getPendingOccurrences,
  })
}

function useOccurrenceMutation(fn: (id: number) => Promise<unknown>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['recurring'] })
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['wallets'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
  }, [qc])

  return { ...mutation, refresh }
}

export const useConfirmOccurrence = () => useOccurrenceMutation(confirmOccurrence)
export const useRejectOccurrence = () => useOccurrenceMutation(rejectOccurrence)
export const usePayOccurrenceDebt = () => useOccurrenceMutation(payOccurrenceDebt)
