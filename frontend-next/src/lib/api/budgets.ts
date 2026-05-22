import type { Budget } from '@/types'

import { apiClient } from './client'

export async function getBudgets(): Promise<Budget[]> {
  const res = await apiClient.get<Budget[]>('/budgets')
  return res.data
}

export async function createBudget(data: Omit<Budget, 'id' | 'spentAmount'>): Promise<Budget> {
  const res = await apiClient.post<Budget>('/budgets', data)
  return res.data
}

export async function updateBudget(
  id: number,
  data: Omit<Budget, 'id' | 'spentAmount'>
): Promise<Budget> {
  const res = await apiClient.put<Budget>(`/budgets/${id}`, data)
  return res.data
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/budgets/${id}`)
}
