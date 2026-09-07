import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  getCategories,
  getHiddenIn,
  setCategoryVisibility,
  updateCategory,
} from '@/lib/api/categories'
import type { Category, CategoryType } from '@/types'

/** `walletId` filtra las ocultas en esa billetera; sin él, todas. */
export function useCategories(type?: CategoryType, walletId?: number) {
  return useQuery({
    queryKey: ['categories', type ?? 'all', walletId ?? 'todas'],
    queryFn: () => getCategories(type, walletId),
    staleTime: 5 * 60 * 1000,
  })
}

/** En qué billeteras está oculta una categoría. */
export function useHiddenIn(categoryId?: number) {
  return useQuery({
    queryKey: ['category-hidden-in', categoryId],
    queryFn: () => getHiddenIn(categoryId as number),
    enabled: categoryId != null,
  })
}

export function useSetCategoryVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, walletId, hidden }: { categoryId: number; walletId: number; hidden: boolean }) =>
      setCategoryVisibility(categoryId, walletId, hidden),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['category-hidden-in', v.categoryId] })
    },
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
