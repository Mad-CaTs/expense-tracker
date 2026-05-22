import type { Period, ReportSummary } from '@/types'

import { apiClient } from './client'

export async function getReportSummary(period: Period): Promise<ReportSummary> {
  const res = await apiClient.get<ReportSummary>('/reports/summary', {
    params: { period },
  })
  return res.data
}
