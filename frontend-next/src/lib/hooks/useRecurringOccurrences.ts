import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  confirmOccurrence,
  getPendingOccurrences,
  payOccurrenceDebt,
  rejectOccurrence,
} from '@/lib/api/recurringOccurrences'

export function usePendingOccurrences() {
  return useQuery({
    queryKey: ['recurring', 'occurrences', 'pending'],
    queryFn: getPendingOccurrences,
  })
}

/**
 * Confirmar genera un gasto y rechazar deja deuda: ambas mutaciones invalidan
 * también gastos y billeteras, cuyo saldo se deriva de esos movimientos.
 *
 * La invalidación NO va en `onSuccess`: refrescar ahí saca la ocurrencia de la
 * lista en el acto y desmonta su tarjeta, así que no hay tiempo de mostrar qué
 * se resolvió. Se expone `refresh` para que la pantalla lo dispare cuando su
 * animación de salida haya terminado.
 */
function useOccurrenceMutation(fn: (id: number) => Promise<unknown>) {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: fn })

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['recurring'] })
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['wallets'] })
    // Confirmar genera un gasto, así que el breakdown por categoría —el que
    // alimenta los totales de /categories y /expenses— también queda viejo.
    qc.invalidateQueries({ queryKey: ['reports'] })
  }, [qc])

  return { ...mutation, refresh }
}

export const useConfirmOccurrence = () => useOccurrenceMutation(confirmOccurrence)
export const useRejectOccurrence = () => useOccurrenceMutation(rejectOccurrence)
export const usePayOccurrenceDebt = () => useOccurrenceMutation(payOccurrenceDebt)
