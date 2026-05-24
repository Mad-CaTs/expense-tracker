import type { CategoryBreakdown, Period, ReportSummary } from '@/types'

import { apiClient } from './client'

export async function getReportSummary(period: Period): Promise<ReportSummary> {
  const res = await apiClient.get<ReportSummary>('/reports/summary', {
    params: { period },
  })
  return res.data
}

export async function getCategoryBreakdown(period: Period): Promise<CategoryBreakdown[]> {
  const res = await apiClient.get<CategoryBreakdown[]>('/reports/by-category', {
    params: { period },
  })
  return res.data
}
