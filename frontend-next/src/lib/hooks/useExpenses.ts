import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from '@/lib/api/expenses'
import type { Expense, ExpenseFilters } from '@/types'

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
    placeholderData: (prev) => prev,
  })
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => getExpense(id),
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

const EXPENSE_KEYS = ['expenses', 'wallets', 'reports']

export function useCreateExpense() {
  return useMovementMutation(createExpense, EXPENSE_KEYS)
}

export function useUpdateExpense() {
  return useMovementMutation(
    ({
      id,
      data,
    }: {
      id: number
      data: Pick<Expense, 'description' | 'amount' | 'date' | 'notes'> & { categoryId: number }
    }) => updateExpense(id, data),
    EXPENSE_KEYS,
  )
}

export function useDeleteExpense() {
  return useMovementMutation(deleteExpense, EXPENSE_KEYS)
}
