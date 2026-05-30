import type { CategoryBreakdown, Period, ReportSummary } from '@/types'

import { apiClient } from './client'

interface ReportParams {
  period: Period
  from?: string
  to?: string
}

export async function getReportSummary({ period, from, to }: ReportParams): Promise<ReportSummary> {
  const res = await apiClient.get<ReportSummary>('/reports/summary', {
    params: { period, from, to },
  })
  return res.data
}

export async function getCategoryBreakdown({ period, from, to }: ReportParams): Promise<CategoryBreakdown[]> {
  const res = await apiClient.get<CategoryBreakdown[]>('/reports/by-category', {
    params: { period, from, to },
  })
  return res.data
}
