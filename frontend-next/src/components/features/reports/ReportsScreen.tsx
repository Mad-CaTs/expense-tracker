'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { FlowCard } from '@/components/features/reports/FlowCard'
import { PeriodMovementList } from '@/components/features/reports/PeriodMovementList'
import { ReportFilters, type ReportTxType } from '@/components/features/reports/ReportFilters'
import { WalletScopeCard } from '@/components/features/reports/WalletScopeCard'
import { fromReportQuery, toReportQuery } from '@/components/features/reports/reportQuery'
import { usePeriodMovements } from '@/components/features/reports/usePeriodMovements'
import { usePeriodRange } from '@/components/features/reports/usePeriodRange'
import { useCategories } from '@/lib/hooks/useCategories'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useWallets } from '@/lib/hooks/useWallets'


function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="mb-[18px] flex gap-2.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[132px] flex-1 animate-pulse rounded-[20px]" style={{ background: 'var(--skeleton-from)' }} />
      ))}
    </div>
  )
}

export function ReportsScreen() {
  const router = useRouter()
  const params = useSearchParams()

  const [seed] = useState(() => fromReportQuery(params))

  const { granularity, periodDate, setPeriodDate, setRange, setPeriod, reset, range, label, longLabel, isCurrent, isCustom } =
    usePeriodRange(seed.granularity, { date: seed.date, custom: seed.custom })

  const [categoryIds, setCategoryIds] = useState<number[]>(seed.categoryIds)
  const [picked, setPicked] = useState<number | null>(seed.walletId)
  const [txType, setTxType] = useState<ReportTxType>(seed.txType)

  const { data: wallets = [] } = useWallets()
  const activeWalletId = useActiveWallet()
  // El selector solo ofrece las categorías visibles en esta billetera.
  const { data: categories = [] } = useCategories(
    txType === 'ALL' ? undefined : txType,
    activeWalletId,
  )

  /* La billetera activa manda: se eligió en /wallets y se arrastra por toda la
     app. `picked` (el ?wallet= de una URL guardada) solo se usa mientras la
     activa no se conoce.

     Antes era al revés y el saldo de /reports podía discrepar del de /expenses:
     `picked` se congela al montar, así que una URL con ?wallet= —guardada, o
     recuperada con el botón atrás— dejaba la pantalla anclada a esa billetera
     aunque el usuario ya hubiera cambiado de billetera en la portada. Y el
     efecto que reescribe la URL volvía a estampar ese id, perpetuándolo. */
  const walletId = activeWalletId ?? picked ?? null

  const { days, totals, isLoading: loadingMovements } = usePeriodMovements(range.from, range.to, { categoryIds, walletId: walletId ?? undefined, txType })

  const expenseTotal = totals.expense
  const incomeTotal = totals.income

  const scope = { walletId, txType, categoryIds, granularity, periodDate, isCustom, range }

  useEffect(() => {
    router.replace(`/reports?${toReportQuery(scope)}`, { scroll: false })
  }, [router, walletId, txType, categoryIds, granularity, periodDate, isCustom, range.from, range.to])

  function openAnalytics(type: 'expense' | 'income') {
    const q = toReportQuery({ ...scope, txType: type.toUpperCase() as ReportTxType })
    router.push(`/reports/analytics?${q}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-4 pt-[11px]">
      {wallets.length > 0 && (
        <div className="enter-pop -mx-4" style={{ ['--enter-i' as string]: 0 }}>
          <WalletScopeCard wallets={wallets} walletId={walletId ?? 0} />
        </div>
      )}

      <div className="enter-pop" style={{ ['--enter-i' as string]: 1 }}>
        <ReportFilters
          state={{ categoryIds, granularity, txType }}
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
            setPicked(null)
            setTxType('ALL')
            reset()
          }}
          onChange={(next) => {
            setCategoryIds(next.txType === 'ALL' ? [] : next.categoryIds)
            setTxType(next.txType)
          }}
        />
      </div>

      {loadingMovements ? (
        <CardsSkeleton count={txType === 'ALL' ? 2 : 1} />
      ) : (
        /* Con un tipo elegido la otra card mostraría S/ 0 siempre: ocupaba
           media pantalla para no decir nada. La que queda se estira sola —las
           dos son flex-1— y su chevron sigue llevando a Analytics. */
        <div className="enter-pop mb-[18px] flex gap-2.5" style={{ ['--enter-i' as string]: 2 }}>
          {txType !== 'INCOME' && (
            <FlowCard
              kind="expense"
              total={expenseTotal}
              onClick={() => openAnalytics('expense')}
            />
          )}
          {txType !== 'EXPENSE' && (
            <FlowCard
              kind="income"
              total={incomeTotal}
              onClick={() => openAnalytics('income')}
            />
          )}
        </div>
      )}

      <div className="enter-pop -mx-4" style={{ ['--enter-i' as string]: 3 }}>
        <PeriodMovementList
          days={days}
          isLoading={loadingMovements}
          title="Movimientos"
          period={longLabel}
        />
      </div>
    </div>
  )
}
