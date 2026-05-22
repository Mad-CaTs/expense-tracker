import type { Expense, ExpenseFilters, ExpensePage } from '@/types'

import { apiClient } from './client'

export async function getExpenses(filters: ExpenseFilters): Promise<ExpensePage> {
  const { page, size, period, categoryId, startDate, endDate, minAmount, maxAmount } = filters
  const params: Record<string, string | number> = { page, size, period }
  if (categoryId) params.categoryId = categoryId
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (minAmount != null) params.minAmount = minAmount
  if (maxAmount != null) params.maxAmount = maxAmount
  const res = await apiClient.get<ExpensePage>('/expenses', { params })
  return res.data
}

export async function getExpense(id: number): Promise<Expense> {
  const res = await apiClient.get<Expense>(`/expenses/${id}`)
  return res.data
}

export async function createExpense(
  data: Omit<Expense, 'id' | 'category'> & { categoryId: number }
): Promise<Expense> {
  const res = await apiClient.post<Expense>('/expenses', data)
  return res.data
}

export async function updateExpense(
  id: number,
  data: Omit<Expense, 'id' | 'category'> & { categoryId: number }
): Promise<Expense> {
  const res = await apiClient.put<Expense>(`/expenses/${id}`, data)
  return res.data
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`)
}
