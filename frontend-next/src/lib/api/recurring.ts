import type { RecurringExpense, CreateRecurringPayload } from '@/types'

import { apiClient } from './client'

export async function getRecurring(): Promise<RecurringExpense[]> {
  const res = await apiClient.get<RecurringExpense[]>('/recurring')
  return res.data
}

export async function createRecurring(data: CreateRecurringPayload): Promise<RecurringExpense> {
  const res = await apiClient.post<RecurringExpense>('/recurring', data)
  return res.data
}

export async function toggleRecurring(id: number): Promise<RecurringExpense> {
  const res = await apiClient.patch<RecurringExpense>(`/recurring/${id}/toggle`)
  return res.data
}

export async function deleteRecurring(id: number): Promise<void> {
  await apiClient.delete(`/recurring/${id}`)
}
