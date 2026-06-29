'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { WalletCarousel } from '@/components/features/expenses/WalletCarousel'
import { BudgetCarousel } from '@/components/features/expenses/BudgetCarousel'
import { BalanceHero } from '@/components/features/expenses/BalanceHero'
import { TransactionList, type MixedTx } from '@/components/features/expenses/TransactionList'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FinanceFilters, FinanceFilterType, DatePreset, TxType, applyFinanceFilters, type FinanceFilter } from '@/components/ui/finance-filters'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useIncomes } from '@/lib/hooks/useIncomes'
import { useCategories } from '@/lib/hooks/useCategories'
import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

function ExpensesPageInner() {
  const searchParams = useSearchParams()
  const initialCategoryId = searchParams.get('categoryId')
  const storeFilters = useFilterStore()
  const { data: wallets = [] } = useWallets()

  const [activeFilters, setActiveFilters] = useState<FinanceFilter[]>(() => {
    const base: FinanceFilter[] = [
      { id: 'default-date', type: FinanceFilterType.FECHA, value: [DatePreset.THIS_MONTH] },
    ]
    if (initialCategoryId) {
      base.push({ id: 'default-tipo', type: FinanceFilterType.TIPO, value: [TxType.EXPENSE] })
      base.push({ id: 'deeplink-cat', type: FinanceFilterType.CATEGORIA, value: [initialCategoryId] })
    } else {
      base.push({ id: 'default-tipo', type: FinanceFilterType.TIPO, value: [TxType.ALL] })
    }
    return base
  })

  const { data: categories } = useCategories('EXPENSE')
  const { startDate, endDate, categoryIds, txType } = applyFinanceFilters(activeFilters)

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const defaultFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const defaultTo = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`

  const { data: expenseData, isLoading: expenseLoading } = useExpenses({
    period: 'MONTHLY',
    categoryId: categoryIds?.[0],
    walletId: storeFilters.walletId,
    startDate: startDate ?? defaultFrom,
    endDate: endDate ?? defaultTo,
    page: storeFilters.currentPage,
    size: 20,
  })

  const { data: incomeData, isLoading: incomeLoading } = useIncomes({
    from: startDate ?? defaultFrom,
    to: endDate ?? defaultTo,
    walletId: storeFilters.walletId,
    page: storeFilters.currentPage,
    size: 20,
  })

  function handleWalletSelect(id: number | undefined) {
    storeFilters.setWalletId(id)
    storeFilters.setPage(0)
  }

  const isLoading = expenseLoading || incomeLoading
  const expenses = expenseData?.content ?? []
  const incomes = incomeData?.content ?? []

  const mixed: MixedTx[] = [
    ...(txType !== 'income' ? expenses.map((e) => ({ kind: 'expense' as const, data: e })) : []),
    ...(txType !== 'expense' ? incomes.map((e) => ({ kind: 'income' as const, data: e })) : []),
  ].sort((a, b) => b.data.date.localeCompare(a.data.date))

  const totalPages = Math.max(expenseData?.totalPages ?? 0, incomeData?.totalPages ?? 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between px-4 pt-6">
        <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Hola de nuevo</p>
      </div>

      <BalanceHero wallets={wallets} selectedWalletId={storeFilters.walletId} />

      <WalletCarousel selectedWalletId={storeFilters.walletId} onSelect={handleWalletSelect} />

      <div className="px-4 pt-4">
        <SectionHeader title="Presupuestos" />
      </div>
      <BudgetCarousel />

      <div className="px-4 pt-5">
        <SectionHeader title="Movimientos" />
      </div>

      <FinanceFilters
        filters={activeFilters}
        setFilters={setActiveFilters}
        categories={categories}
      />

      <div className="mt-2 px-2">
        {isLoading ? (
          <div className="overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
          </div>
        ) : mixed.length === 0 ? (
          <EmptyState
            title={storeFilters.walletId ? 'Sin registros en esta cuenta' : 'Sin registros en este período'}
            description="Toca el botón + para registrar tu primer gasto o ingreso."
          />
        ) : (
          <TransactionList items={mixed} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 p-4">
          <button
            className="h-8 rounded-full px-4 text-[11px] font-semibold disabled:opacity-30"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            disabled={storeFilters.currentPage === 0}
            onClick={() => storeFilters.setPage(storeFilters.currentPage - 1)}
          >
            ← Anterior
          </button>
          <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {storeFilters.currentPage + 1} / {totalPages}
          </span>
          <button
            className="h-8 rounded-full px-4 text-[11px] font-semibold disabled:opacity-30"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            disabled={storeFilters.currentPage >= totalPages - 1}
            onClick={() => storeFilters.setPage(storeFilters.currentPage + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesPageInner />
    </Suspense>
  )
}
