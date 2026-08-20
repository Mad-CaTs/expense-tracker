import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createBudget, deleteBudget, getBudgets, updateBudget, type CreateBudgetPayload } from '@/lib/api/budgets'

export function useBudgets(walletId?: number, options?: { requireWallet?: boolean }) {
  return useQuery({
    queryKey: ['budgets', walletId ?? null],
    queryFn: () => getBudgets(walletId),
    enabled: options?.requireWallet ? walletId != null : true,
  })
}

function useBudgetMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['budgets'] })
  }, [qc])
  return { ...mutation, refresh }
}

export const useCreateBudget = () =>
  useBudgetMutation((data: CreateBudgetPayload) => createBudget(data))

export const useUpdateBudget = () =>
  useBudgetMutation(({ id, amount }: { id: number; amount: number }) => updateBudget(id, amount))

export const useDeleteBudget = () => useBudgetMutation(deleteBudget)
