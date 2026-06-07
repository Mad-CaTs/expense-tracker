import type { Expense, ExpenseFilters, ExpensePage } from '@/types'

import { apiClient } from './client'

function periodToRange(period: string): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)

  switch (period) {
    case 'YEARLY':
      return { from: `${now.getFullYear()}-01-01`, to: today }
    case 'LAST_MONTH': {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: fmt(d), to: fmt(last) }
    }
    case 'WEEKLY': {
      const day = now.getDay() || 7
      const mon = new Date(now)
      mon.setDate(now.getDate() - day + 1)
      return { from: fmt(mon), to: today }
    }
    default: // MONTHLY
      return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: today }
  }
}

export async function getExpenses(filters: ExpenseFilters): Promise<ExpensePage> {
  const { page, size, period, categoryId, walletId, startDate, endDate, minAmount, maxAmount } = filters
  const { from, to } = startDate && endDate
    ? { from: startDate, to: endDate }
    : periodToRange(period)

  const params: Record<string, string | number> = { page, size, from, to }
  if (categoryId) params.categoryId = categoryId
  if (walletId) params.walletId = walletId
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
  data: Pick<Expense, 'description' | 'amount' | 'date' | 'notes'> & { categoryId: number }
): Promise<Expense> {
  const res = await apiClient.post<Expense>('/expenses', data)
  return res.data
}

export async function updateExpense(
  id: number,
  data: Pick<Expense, 'description' | 'amount' | 'date' | 'notes'> & { categoryId: number }
): Promise<Expense> {
  const res = await apiClient.put<Expense>(`/expenses/${id}`, data)
  return res.data
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`)
}
