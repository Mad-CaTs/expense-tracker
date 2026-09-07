import type { CategoryBreakdown, DailyTotal, Period, ReportSummary } from '@/types'

import { apiClient } from './client'

interface ReportParams {
  period: Period
  from?: string
  to?: string
  txType?: 'EXPENSE' | 'INCOME'
  walletId?: number
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
export async function getDailyTotals(params: ReportParams): Promise<DailyTotal[]> {
  const res = await apiClient.get<DailyTotal[]>('/reports/daily', { params })
  return res.data
}
