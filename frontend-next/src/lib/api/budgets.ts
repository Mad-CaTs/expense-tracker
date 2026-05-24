import type { Budget } from '@/types'

import { apiClient } from './client'

export interface CreateBudgetPayload {
  categoryId: number
  amount: number
  month: number
  year: number
}

export async function getBudgets(): Promise<Budget[]> {
  const now = new Date()
  const res = await apiClient.get<Budget[]>('/budgets', {
    params: { month: now.getMonth() + 1, year: now.getFullYear() },
  })
  return res.data
}

export async function createBudget(data: CreateBudgetPayload): Promise<Budget> {
  const res = await apiClient.post<Budget>('/budgets', data)
  return res.data
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/budgets/${id}`)
}
