'use client'

import { useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { CategoryBreakdown } from '@/components/features/reports/CategoryBreakdown'
import { ReportSummary } from '@/components/features/reports/ReportSummary'
import { useReportSummary } from '@/lib/hooks/useReports'
import type { Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'MONTHLY', label: 'Este mes' },
  { value: 'LAST_MONTH', label: 'Mes anterior' },
  { value: 'YEARLY', label: 'Este año' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('MONTHLY')
  const { data, isLoading } = useReportSummary(period)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e0d5] mb-4">Reportes</h1>

      <div className="flex gap-2 mb-6">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
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
          <CategoryBreakdown breakdown={data.categoryBreakdown} />
        </>
      )}
    </div>
  )
}
