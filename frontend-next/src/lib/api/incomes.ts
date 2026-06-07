import type { Income, IncomePage } from '@/types'

import { apiClient } from './client'

export async function getIncomes(params: {
  from?: string
  to?: string
  walletId?: number
  page: number
  size: number
}): Promise<IncomePage> {
  const res = await apiClient.get<IncomePage>('/incomes', { params })
  return res.data
}

export async function getIncome(id: number): Promise<Income> {
  const res = await apiClient.get<Income>(`/incomes/${id}`)
  return res.data
}

export async function createIncome(data: {
  amount: number
  description?: string
  date: string
  notes?: string
  walletId?: number
}): Promise<Income> {
  const res = await apiClient.post<Income>('/incomes', data)
  return res.data
}

export async function updateIncome(
  id: number,
  data: {
    amount: number
    description?: string
    date: string
    notes?: string
    walletId?: number
  }
): Promise<Income> {
  const res = await apiClient.put<Income>(`/incomes/${id}`, data)
  return res.data
}

export async function deleteIncome(id: number): Promise<void> {
  await apiClient.delete(`/incomes/${id}`)
}
