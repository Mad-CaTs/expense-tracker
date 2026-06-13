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

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Category, 'id'> }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
