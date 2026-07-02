import type { Budget } from '@/types'

import { apiClient } from './client'

export interface CreateBudgetPayload {
  categoryId: number
  walletId: number
  amount: number
}

export async function getBudgets(walletId?: number): Promise<Budget[]> {
  const res = await apiClient.get<Budget[]>('/budgets', {
    params: walletId ? { walletId } : {},
  })
  return res.data
}

export async function createBudget(data: CreateBudgetPayload): Promise<Budget> {
  const res = await apiClient.post<Budget>('/budgets', data)
  return res.data
}

export async function updateBudget(id: number, amount: number): Promise<Budget> {
  const res = await apiClient.put<Budget>(`/budgets/${id}`, { amount })
  return res.data
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/budgets/${id}`)
}
