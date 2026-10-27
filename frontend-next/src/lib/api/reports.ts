import type { CategoryBreakdown, DailyTotal, Period, ReportSummary } from '@/types'

import { apiClient } from './client'

interface ReportParams {
  period: Period
  from?: string
  to?: string
  txType?: 'EXPENSE' | 'INCOME'
  walletId?: number
  /** Solo las categorías elegidas en el filtro. Vacío o ausente = todas. */
  categoryIds?: number[]
}

export async function getReportSummary({ period, from, to }: ReportParams): Promise<ReportSummary> {
  const res = await apiClient.get<ReportSummary>('/reports/summary', {
    params: { period, from, to },
  })
  return res.data
}

export async function getCategoryBreakdown({ period, from, to, txType, walletId }: ReportParams): Promise<CategoryBreakdown[]> {
  const res = await apiClient.get<CategoryBreakdown[]>('/reports/by-category', {
    params: { period, from, to, txType, walletId },
  })
  return res.data
}

/** Total por día del periodo. Solo trae los días CON movimiento. */
export async function getDailyTotals({ categoryIds, ...params }: ReportParams): Promise<DailyTotal[]> {
  // Como "1,2" y no como arreglo: axios lo mandaría `categoryIds[]=1`, que
  // Spring no enlaza a List<Long>; la lista separada por comas sí.
  const res = await apiClient.get<DailyTotal[]>('/reports/daily', {
    params: { ...params, categoryIds: categoryIds?.length ? categoryIds.join(',') : undefined },
  })
  return res.data
}
