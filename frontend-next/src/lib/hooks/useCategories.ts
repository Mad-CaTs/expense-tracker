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

/**
 * Mutación de categorías con refresco MANUAL.
 *
 * La invalidación no va en `onSuccess`: refrescar ahí recalcula el hero y el
 * grid mientras el aviso de éxito todavía no se vio, así que el total cambia
 * detrás del modal. La pantalla dispara `refresh()` al descartarlo, y el número
 * recorre a la vista.
 *
 * Quien no muestre aviso —CategorySelector crea al vuelo desde el formulario de
 * gastos— debe llamar `refresh()` en su propio `onSuccess`.
 */
function useCategoryMutation<TVars, TData = unknown>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['categories'] })
    // El total y el contador de movimientos del hero salen del BREAKDOWN, no de
    // la lista de categorías: sin invalidar esto, la cifra nunca se recalculaba.
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
