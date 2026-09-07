import { useQuery } from '@tanstack/react-query'

import { getDailyTotals, getCategoryBreakdown, getReportSummary } from '@/lib/api/reports'
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

export function useDailyTotals(filters: ReportFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'daily', filters],
    queryFn: () => getDailyTotals(filters),
    enabled: options?.enabled ?? true,
  })
}

export function useCategoryBreakdown(filters: ReportFilters, options?: { requireWallet?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'by-category', filters],
    queryFn: () => getCategoryBreakdown(filters),
    enabled: options?.requireWallet ? filters.walletId != null : true,
  })
}
