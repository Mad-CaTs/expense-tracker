import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createBudget, deleteBudget, getBudgets, updateBudget, type CreateBudgetPayload } from '@/lib/api/budgets'

export function useBudgets(walletId?: number) {
  return useQuery({
    queryKey: ['budgets', walletId ?? null],
    queryFn: () => getBudgets(walletId),
  })
}

/**
 * La invalidación NO va en `onSuccess`: refrescar ahí recalcula el resumen
 * mientras el aviso de éxito todavía no se vio, así que el total cambia detrás
 * del modal. Se expone `refresh` para que la pantalla lo dispare al descartar
 * el aviso, y el número recorra a la vista.
 */
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
