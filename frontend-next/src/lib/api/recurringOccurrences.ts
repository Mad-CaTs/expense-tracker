import type { RecurringOccurrence } from '@/types'

import { apiClient } from './client'

/**
 * Ocurrencias de gastos recurrentes.
 *
 * El scheduler ya no crea el gasto automáticamente: genera una ocurrencia
 * PENDING que el usuario confirma (pasa a PAID y nace el Expense) o rechaza
 * (pasa a SKIPPED y queda como deuda pagable después).
 */
export async function getPendingOccurrences(): Promise<RecurringOccurrence[]> {
  const res = await apiClient.get<RecurringOccurrence[]>('/recurring/occurrences/pending')
  return res.data
}

export async function getOccurrenceHistory(recurringId: number): Promise<RecurringOccurrence[]> {
  const res = await apiClient.get<RecurringOccurrence[]>('/recurring/occurrences/history', {
    params: { recurringId },
  })
  return res.data
}

export async function confirmOccurrence(id: number): Promise<RecurringOccurrence> {
  const res = await apiClient.post<RecurringOccurrence>(`/recurring/occurrences/${id}/confirm`)
  return res.data
}

export async function rejectOccurrence(id: number): Promise<RecurringOccurrence> {
  const res = await apiClient.post<RecurringOccurrence>(`/recurring/occurrences/${id}/reject`)
  return res.data
}

/** Paga una ocurrencia SKIPPED: la deuda que quedó al rechazarla. */
export async function payOccurrenceDebt(id: number): Promise<RecurringOccurrence> {
  const res = await apiClient.post<RecurringOccurrence>(`/recurring/occurrences/${id}/pay-debt`)
  return res.data
}
