import { useQuery } from '@tanstack/react-query'

import { getReportSummary } from '@/lib/api/reports'
import type { Period } from '@/types'

export function useReportSummary(period: Period) {
  return useQuery({
    queryKey: ['reports', period],
    queryFn: () => getReportSummary(period),
  })
}
