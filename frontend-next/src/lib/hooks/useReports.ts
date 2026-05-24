import { useQuery } from '@tanstack/react-query'

import { getCategoryBreakdown, getReportSummary } from '@/lib/api/reports'
import type { Period } from '@/types'

export function useReportSummary(period: Period) {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: () => getReportSummary(period),
  })
}

export function useCategoryBreakdown(period: Period) {
  return useQuery({
    queryKey: ['reports', 'by-category', period],
    queryFn: () => getCategoryBreakdown(period),
  })
}
