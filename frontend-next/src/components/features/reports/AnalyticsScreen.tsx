'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { ChartColumnBig, CircleDashed } from 'lucide-react'

import { CategoryBars } from '@/components/features/reports/CategoryBars'
import { BudgetRisk, buildBudgetUsage } from '@/components/features/reports/BudgetRisk'
import { buildDeltas, CategoryDeltas } from '@/components/features/reports/CategoryDeltas'
import { DayMovementsDialog } from '@/components/features/reports/DayMovementsDialog'
import { SpendingCalendar } from '@/components/features/reports/SpendingCalendar'
import { usePeriodMovements } from '@/components/features/reports/usePeriodMovements'
import { CategoryTiles } from '@/components/features/reports/CategoryTiles'
import { ReportFilters } from '@/components/features/reports/ReportFilters'
import { SpokeDonut } from '@/components/features/reports/SpokeDonut'
import { fromReportQuery } from '@/components/features/reports/reportQuery'
import { longLabelOf, previousDate, rangeOf, usePeriodRange } from '@/components/features/reports/usePeriodRange'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { useCategories } from '@/lib/hooks/useCategories'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { useCategoryBreakdown, useDailyTotals } from '@/lib/hooks/useReports'

type ChartMode = 'donut' | 'bars'

function ChartSkeleton() {
  return <div className="mx-4 h-[340px] animate-pulse rounded-[22px]" style={{ background: 'var(--skeleton-from)' }} />
}

export function AnalyticsScreen() {
  const params = useSearchParams()
  const { exitClass, goBack } = useSubPageExit()

  const txType = params.get('type') === 'income' ? 'INCOME' : 'EXPENSE'
  const isIncome = txType === 'INCOME'

  const [seed] = useState(() => fromReportQuery(params))

  const { granularity, periodDate, setPeriodDate, setRange, setPeriod, reset, range, label, isCurrent, isCustom } =
    usePeriodRange(seed.granularity, { date: seed.date, custom: seed.custom })

  const [mode, setMode] = useState<ChartMode>('donut')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [categoryIds, setCategoryIds] = useState<number[]>(seed.categoryIds)
  /** Día abierto en el detalle; `null` con el diálogo cerrado. */
  const [openDay, setOpenDay] = useState<string | null>(null)
  const activeWalletId = useActiveWallet()
  const walletId = seed.walletId ?? activeWalletId ?? null
  // El selector solo ofrece las categorías visibles en esta billetera: filtrar
  // por una oculta no devolvería nada, porque no se registra nada con ella acá.
  const { data: categories = [] } = useCategories(txType, walletId ?? undefined)

  const filters = { period: 'CUSTOM' as const, ...range }
  const { data: breakdown = [], isLoading } = useCategoryBreakdown({
    ...filters,
    txType,
    walletId: walletId ?? undefined,
  })

  /* Mismo periodo, un mes/trimestre/año atrás: es la base de la comparativa.
     El endpoint ya acepta un rango arbitrario, así que no hace falta backend. */
  const prevRange = rangeOf(granularity, previousDate(granularity, periodDate))
  const { data: prevBreakdown = [] } = useCategoryBreakdown({
    period: 'CUSTOM',
    ...prevRange,
    txType,
    walletId: walletId ?? undefined,
  })
  /* El ritmo solo tiene sentido en un rango continuo con varios días. En
     personalizados se oculta, como acordamos. */
  const { data: daily = [] } = useDailyTotals(
    { period: 'CUSTOM', ...range, txType, walletId: walletId ?? undefined },
    { enabled: !isCustom },
  )

  const sorted = [...breakdown].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
  const names = new Set(
    categoryIds.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean) as string[]
  )
  const items = names.size > 0 ? sorted.filter((b) => names.has(b.categoryName)) : sorted

  /* Los presupuestos son por billetera y no dependen del periodo: el gasto que
     se cruza con ellos sí. */
  const { data: budgets = [] } = useBudgets(walletId ?? undefined, { requireWallet: true })
  const budgetUsage = buildBudgetUsage(budgets, breakdown)

  /* Movimientos del periodo agrupados por día: el diálogo del calendario los
     lee de acá en vez de pedir otra consulta por cada día que se abra. */
  const { days: movementDays } = usePeriodMovements(range.from, range.to, {
    walletId: walletId ?? undefined,
    txType,
  })

  const deltas = buildDeltas(items, prevBreakdown)
  const previousLabel = longLabelOf(granularity, previousDate(granularity, periodDate))

  function toggle(i: number) {
    setActiveIndex((prev) => (prev === i ? null : i))
  }

  return (
    <div className={`pb-10 ${exitClass}`}>
      <SubPageHeader title="Estadísticas" onBack={goBack} />

      <div className="enter-pop px-4 pt-[9px]" style={{ ['--enter-i' as string]: 0 }}>
        <ReportFilters
          state={{ categoryIds, granularity, txType: isIncome ? 'INCOME' : 'EXPENSE' }}
          categories={categories}
          periodLabel={label}
          range={range}
          isCurrent={isCurrent}
          isCustom={isCustom}
          periodDate={periodDate}
          onNavigate={setPeriodDate}
          onRange={setRange}
          onPeriod={setPeriod}
          onReset={() => {
            setCategoryIds([])
            setActiveIndex(null)
            reset()
          }}
          hideTxType
          onChange={(next) => {
            setCategoryIds(next.categoryIds)
            setActiveIndex(null)
          }}
        />
      </div>

      <div className="enter-pop liquid-glass mx-4 mb-[18px] flex gap-1.5 rounded-full p-[5px]" style={{ ['--enter-i' as string]: 1 }}>
        {([['donut', 'Donut', CircleDashed], ['bars', 'Barras', ChartColumnBig]] as const).map(([key, text, Icon]) => {
          const on = mode === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-[12.5px] font-bold transition-colors"
              style={on ? { background: 'var(--accent-light)', color: 'var(--bg-base)' } : { color: 'var(--text-muted)' }}
            >
              <Icon size={14} strokeWidth={2} />
              {text}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : items.length === 0 ? (
        <div className="px-4">
          <EmptyState title={isIncome ? 'Sin ingresos en este período' : 'Sin gastos en este período'} />
        </div>
      ) : (
        <>
          <div className="enter-pop liquid-glass mx-4 mb-[18px] rounded-[22px] px-4 py-[18px]" style={{ ['--enter-i' as string]: 2 }}>
            {mode === 'donut' ? (
              <SpokeDonut
                breakdown={items}
                activeIndex={activeIndex}
                onSelect={toggle}
                label={isIncome ? 'Ingresos' : 'Gastos'}
              />
            ) : (
              <CategoryBars breakdown={items} activeIndex={activeIndex} onSelect={toggle} />
            )}
            <CategoryTiles breakdown={items} activeIndex={activeIndex} onSelect={toggle} />
          </div>

          {/* Lo único que dice QUÉ HACER, y por eso va primero. Solo en gastos:
              un presupuesto limita lo que sale, no lo que entra. */}
          {!isIncome && budgetUsage.length > 0 && (
            <>
              <div className="flex items-center px-[18px] pb-2">
                <h2 className="text-[15.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                  Presupuestos
                </h2>
              </div>
              <div className="enter-pop liquid-glass mx-4 mb-3 rounded-[22px] px-4 py-[18px]" style={{ ['--enter-i' as string]: 2 }}>
                <BudgetRisk usage={budgetUsage} />
              </div>
            </>
          )}

          {/* Cuándo se gasta: el mapa revela el patrón (fines de semana,
              principio de mes) que un acumulado no deja ver. */}
          {!isCustom && daily.length > 0 && (
            <>
              <div className="flex items-center px-[18px] pb-2">
                <h2 className="text-[15.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                  Cuándo gastas
                </h2>
              </div>
              <div className="enter-pop liquid-glass mx-4 mb-3 rounded-[22px] px-4 py-[18px]" style={{ ['--enter-i' as string]: 3 }}>
                <SpendingCalendar
                  daily={daily}
                  from={range.from}
                  to={range.to}
                  isIncome={isIncome}
                  onSelectDay={setOpenDay}
                />
              </div>
            </>
          )}

          {/* Qué cambió respecto al periodo anterior. Reemplaza al ranking, que
              repetía lo que el donut ya dice: en qué se gasta más. */}
          <div className="flex items-center justify-between px-[18px] pb-2">
            <h2 className="text-[15.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
              Variación
            </h2>
            <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
              vs. {previousLabel}
            </span>
          </div>

          <div className="enter-pop liquid-glass mx-4 mb-3 rounded-[22px] px-4 py-[14px]" style={{ ['--enter-i' as string]: 3 }}>
            <CategoryDeltas deltas={deltas} previousLabel={previousLabel} />
          </div>

</>
      )}

      <DayMovementsDialog
        date={openDay}
        movements={openDay ? (movementDays.find((d) => d.date === openDay)?.movements ?? []) : []}
        onClose={() => setOpenDay(null)}
      />
    </div>
  )
}
