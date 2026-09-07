import type { Debt, DebtDirection, DebtPayment, DebtPersonGroup, DebtSummary } from '@/types'

import { apiClient } from './client'

export async function getDebts(direction: DebtDirection): Promise<DebtPersonGroup[]> {
  const res = await apiClient.get<DebtPersonGroup[]>('/debts', { params: { direction } })
  return res.data
}

export async function getDebtSummary(): Promise<DebtSummary> {
  const res = await apiClient.get<DebtSummary>('/debts/summary')
  return res.data
}

/** Historial de abonos: con pagos parciales, cuándo entró cada parte. */
export async function getDebtPayments(id: number): Promise<DebtPayment[]> {
  const res = await apiClient.get<DebtPayment[]>(`/debts/${id}/payments`)
  return res.data
}

/** Reparto de un gasto, para poder editarlo sin perderlo. */
export async function getDebtsByExpense(expenseId: number): Promise<Debt[]> {
  const res = await apiClient.get<Debt[]>(`/debts/by-expense/${expenseId}`)
  return res.data
}

/** Préstamo suelto: sin gasto de por medio, así que mueve el saldo al crearse. */
export async function createDebt(data: {
  direction: DebtDirection
  personName: string
  amount: number
  walletId: number
  description?: string
  incurredOn: string
}): Promise<Debt> {
  const res = await apiClient.post<Debt>('/debts', data)
  return res.data
}

export async function payDebt(
  id: number,
  data: { amount: number; walletId: number; paidOn: string },
): Promise<Debt> {
  const res = await apiClient.post<Debt>(`/debts/${id}/pay`, data)
  return res.data
}

export async function deleteDebt(id: number): Promise<void> {
  await apiClient.delete(`/debts/${id}`)
}
