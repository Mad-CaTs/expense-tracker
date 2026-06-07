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

export function useCreateIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useUpdateIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Income, 'id'> }) => updateIncome(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
