import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRecurring,
  deleteRecurring,
  getRecurring,
  toggleRecurring,
} from '@/lib/api/recurring'
import type { CreateRecurringPayload } from '@/types'

export function useRecurring(walletId?: number) {
  return useQuery({ queryKey: ['recurring', walletId ?? null], queryFn: () => getRecurring(walletId) })
}

/**
 * La invalidación NO va en `onSuccess`: refrescar ahí recalcula la lista y el
 * resumen mientras el aviso de éxito todavía no se vio, así que el total cambia
 * detrás del modal. Se expone `refresh` para que la pantalla lo dispare al
 * descartar el aviso, y el número recorra a la vista.
 */
function useRecurringMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['recurring'] })
  }, [qc])
  return { ...mutation, refresh }
}

export const useCreateRecurring = () =>
  useRecurringMutation((data: CreateRecurringPayload) => createRecurring(data))

export const useToggleRecurring = () => useRecurringMutation(toggleRecurring)

export const useDeleteRecurring = () => useRecurringMutation(deleteRecurring)
