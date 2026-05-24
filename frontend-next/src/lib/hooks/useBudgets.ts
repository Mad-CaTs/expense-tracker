import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createBudget, deleteBudget, getBudgets, type CreateBudgetPayload } from '@/lib/api/budgets'

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBudgetPayload) => createBudget(data),
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
