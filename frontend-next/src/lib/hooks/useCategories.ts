import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/api/categories'
import type { Category, CategoryType } from '@/types'

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'],
    queryFn: () => getCategories(type),
    staleTime: 5 * 60 * 1000,
  })
}

function useCategoryMutation<TVars, TData = unknown>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['categories'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
  }, [qc])
  return { ...mutation, refresh }
}

export const useCreateCategory = () =>
  useCategoryMutation((data: Omit<Category, 'id'>) => createCategory(data))

export const useUpdateCategory = () =>
  useCategoryMutation(({ id, data }: { id: number; data: Omit<Category, 'id'> }) => updateCategory(id, data))

export const useDeleteCategory = () =>
  useCategoryMutation((id: number) => deleteCategory(id))
