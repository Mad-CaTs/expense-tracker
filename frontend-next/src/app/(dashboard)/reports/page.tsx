'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { CategoryBreakdown } from '@/components/features/reports/CategoryBreakdown'
import { DonutChart } from '@/components/features/reports/DonutChart'
import { ReportSummaryCards } from '@/components/features/reports/ReportSummaryCards'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { FinanceFilters, FinanceFilterType, TxType, applyFinanceFilters, type FinanceFilter } from '@/components/ui/finance-filters'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCategoryBreakdown, useReportSummary } from '@/lib/hooks/useReports'

type Granularity = 'WEEKLY' | 'MONTHLY'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatPeriodLabel(granularity: Granularity, date: Date): string {
  if (granularity === 'MONTHLY') {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return `${fmt(monday)} – ${fmt(sunday)}`
}

function getRange(granularity: Granularity, date: Date): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (granularity === 'MONTHLY') {
    const from = new Date(date.getFullYear(), date.getMonth(), 1)
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { from: iso(from), to: iso(to) }
  }
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { from: iso(monday), to: iso(sunday) }
}

function navigate(granularity: Granularity, date: Date, delta: number): Date {
  const d = new Date(date)
  if (granularity === 'MONTHLY') {
    d.setMonth(d.getMonth() + delta)
    d.setDate(1)
  } else {
    d.setDate(d.getDate() + delta * 7)
  }
  return d
}

export default function ReportsPage() {
  const [granularity, setGranularity] = useState<Granularity>('MONTHLY')
  const [periodDate, setPeriodDate] = useState(new Date())
  const [activeFilters, setActiveFilters] = useState<FinanceFilter[]>([
    { id: 'default-tipo', type: FinanceFilterType.TIPO, value: [TxType.EXPENSE] },
  ])

  const { data: categories } = useCategories()
  const { txType } = applyFinanceFilters(activeFilters)

  const { from, to } = getRange(granularity, periodDate)
  const filters = { period: 'CUSTOM' as const, from, to }

  const { data, isLoading } = useReportSummary(filters)
  const { data: breakdown } = useCategoryBreakdown(filters)

  const isCurrentPeriod = (() => {
    const now = new Date()
    const { from: nf, to: nt } = getRange(granularity, now)
    return from === nf && to === nt
  })()

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Reportes" />

      {/* Filters — same pattern as /expenses */}
      <FinanceFilters
        filters={activeFilters}
        setFilters={setActiveFilters}
        categories={categories ?? []}
        excludeTxTypes={[TxType.ALL]}
        excludeFilterTypes={[FinanceFilterType.FECHA, FinanceFilterType.CATEGORIA]}
        hideControls
      />

      <div className="px-4 pt-2">
        {/* Granularity + period navigator */}
        <div className="mb-4 flex items-center gap-2">
          {/* Granularity toggles */}
          <div className="flex gap-1.5">
            {(['MONTHLY', 'WEEKLY'] as Granularity[]).map((g) => (
              <motion.button
                key={g}
                onClick={() => { setGranularity(g); setPeriodDate(new Date()) }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors"
                style={
                  granularity === g
                    ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
                    : { background: 'var(--bg-input)', color: 'var(--text-muted)' }
                }
              >
                {g === 'MONTHLY' ? 'Mensual' : 'Semanal'}
              </motion.button>
            ))}
          </div>

          {/* Period navigator */}
          <div
            className="flex flex-1 items-center justify-between rounded-full border px-2 py-1"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}
          >
            <motion.button
              onClick={() => setPeriodDate(d => navigate(granularity, d, -1))}
              whileTap={{ scale: 0.9 }}
              className="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <ChevronLeft size={13} />
            </motion.button>

            <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formatPeriodLabel(granularity, periodDate)}
            </span>

            <motion.button
              onClick={() => !isCurrentPeriod && setPeriodDate(d => navigate(granularity, d, 1))}
              whileTap={{ scale: 0.9 }}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
              style={{
                color: isCurrentPeriod ? 'var(--border-subtle)' : 'var(--text-muted)',
                cursor: isCurrentPeriod ? 'default' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!isCurrentPeriod) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = ''
                e.currentTarget.style.color = isCurrentPeriod ? 'var(--border-subtle)' : 'var(--text-muted)'
              }}
            >
              <ChevronRight size={13} />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-20 rounded-[14px]" />)}
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : !data ? (
          <EmptyState title="Sin datos para este período" />
        ) : (
          <>
            <ReportSummaryCards summary={data} txType={txType} />
          </>
        )}
      </div>

      {/* Charts — own px-4 so titles align with page title */}
      {!isLoading && data && (
        <>
          {txType === 'expense' && (
            <>
              <DonutChart breakdown={breakdown ?? []} />
              <CategoryBreakdown breakdown={breakdown ?? []} />
            </>
          )}
          {txType === 'income' && (
            <div
              className="mx-4 rounded-[18px] border p-5 text-center"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', color: 'var(--text-tertiary)' }}
            >
              <p className="text-sm">Los ingresos aún no están disponibles</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
