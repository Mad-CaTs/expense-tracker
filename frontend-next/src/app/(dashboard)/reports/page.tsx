'use client'

import { useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryBreakdown } from '@/components/features/reports/CategoryBreakdown'
import { ReportSummary } from '@/components/features/reports/ReportSummary'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategoryBreakdown, useReportSummary } from '@/lib/hooks/useReports'
import type { Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'MONTHLY', label: 'Este mes' },
  { value: 'LAST_MONTH', label: 'Mes anterior' },
  { value: 'YEARLY', label: 'Este año' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('MONTHLY')
  const { data, isLoading } = useReportSummary(period)
  const { data: breakdown } = useCategoryBreakdown(period)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Reportes" />
      <div className="px-4">
<div className="mb-6 flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              period === value
                ? { background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#080808' }
                : { background: '#161616', color: '#888' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : !data ? (
        <EmptyState title="Sin datos para este período" />
      ) : (
        <>
          <ReportSummary summary={data} />
          <CategoryBreakdown breakdown={breakdown ?? []} />
        </>
      )}
      </div>
    </div>
  )
}
