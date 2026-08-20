import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createIncome, deleteIncome, getIncome, getIncomes, updateIncome } from '@/lib/api/incomes'
import type { Income } from '@/types'

export function useIncomes(params: { from?: string; to?: string; walletId?: number; page: number; size: number }) {
  return useQuery({
    queryKey: ['incomes', params],
    queryFn: () => getIncomes(params),
    placeholderData: (prev) => prev,
  })
}

export function useIncome(id: number) {
  return useQuery({
    queryKey: ['incomes', id],
    queryFn: () => getIncome(id),
    enabled: id > 0,
  })
}


function useMovementMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>, keys: string[]) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    keys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }))
  }, [qc])
  return { ...mutation, refresh }
}

const INCOME_KEYS = ['incomes', 'wallets', 'reports']

export function useCreateIncome() {
  return useMovementMutation(createIncome, INCOME_KEYS)
}

export function useUpdateIncome() {
  return useMovementMutation(
    ({ id, data }: { id: number; data: Omit<Income, 'id'> }) => updateIncome(id, data),
    INCOME_KEYS,
  )
}

export function useDeleteIncome() {
  return useMovementMutation(deleteIncome, INCOME_KEYS)
}
