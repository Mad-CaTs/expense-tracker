import { useQuery } from '@tanstack/react-query'

import { getDailyTotals, getCategoryBreakdown, getReportSummary } from '@/lib/api/reports'
import type { Period } from '@/types'

interface ReportFilters {
  period: Period
  from?: string
  to?: string
  txType?: 'EXPENSE' | 'INCOME'
  walletId?: number
  /** Solo lo usa el calendario (`/reports/daily`). Va en la queryKey, así que
   *  cambiar el filtro vuelve a pedir los días. */
  categoryIds?: number[]
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
