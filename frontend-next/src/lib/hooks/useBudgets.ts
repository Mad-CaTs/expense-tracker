import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createBudget, deleteBudget, getBudgets, updateBudget, type CreateBudgetPayload } from '@/lib/api/budgets'

export function useBudgets(walletId?: number) {
  return useQuery({
    queryKey: ['budgets', walletId ?? null],
    queryFn: () => getBudgets(walletId),
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBudgetPayload) => createBudget(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => updateBudget(id, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
