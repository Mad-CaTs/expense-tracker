import { useQuery } from '@tanstack/react-query'

import { getCategoryBreakdown, getReportSummary } from '@/lib/api/reports'
import type { Period } from '@/types'

interface ReportFilters {
  period: Period
  from?: string
  to?: string
  txType?: 'EXPENSE' | 'INCOME'
  walletId?: number
}

export function useReportSummary(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => getReportSummary(filters),
  })
}

export function useCategoryBreakdown(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'by-category', filters],
    queryFn: () => getCategoryBreakdown(filters),
  })
}
