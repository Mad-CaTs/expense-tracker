'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, ScanLine } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { WalletCarousel } from '@/components/features/expenses/WalletCarousel'
import { BudgetCarousel } from '@/components/features/expenses/BudgetCarousel'
import { TransactionList, type MixedTx } from '@/components/features/expenses/TransactionList'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FinanceFilters, FinanceFilterType, DatePreset, TxType, applyFinanceFilters, type FinanceFilter } from '@/components/ui/finance-filters'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useIncomes } from '@/lib/hooks/useIncomes'
import { useCategories } from '@/lib/hooks/useCategories'
import { useFilterStore } from '@/stores/filterStore'
import { useSheetStore } from '@/stores/sheetStore'

const QUICK_ACTIONS = [
  { label: 'Gasto',      Icon: ArrowUpRight,   kind: 'expense-form' as const },
  { label: 'Ingreso',    Icon: ArrowDownLeft,  kind: 'income-form'  as const },
  { label: 'Transferir', Icon: ArrowRightLeft, kind: 'transfer'     as const },
  { label: 'Escanear',   Icon: ScanLine,       kind: 'scan'         as const },
]

type QuickActionKind = (typeof QUICK_ACTIONS)[number]['kind']

function QuickActions() {
  const openSheet = useSheetStore((s) => s.open)
  const [soon, setSoon] = useState(false)

  function handle(kind: QuickActionKind) {
    if (kind === 'scan') {
      setSoon(true)
      window.setTimeout(() => setSoon(false), 1800)
      return
    }
    openSheet({ kind })
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, Icon, kind }, i) => (
          <motion.button
            key={kind}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: i * 0.04 }}
            onClick={() => handle(kind)}
            className="soft-action flex flex-col items-center justify-center gap-2 rounded-[20px] py-4 cursor-pointer"
            style={{ background: 'var(--surface-overlay)' }}
          >
            <Icon size={23} style={{ color: 'var(--text-primary)' }} strokeWidth={1.75} />
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {soon && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2.5 text-[13px] font-medium"
            style={{ background: 'var(--surface-overlay)', color: 'var(--text-primary)', boxShadow: 'var(--soft-raised)' }}
          >
            Escaneo de recibos · próximamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ExpensesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategoryId = searchParams.get('categoryId')
  const storeFilters = useFilterStore()
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
    page: 0,
    size: 20,
  })

  const { data: incomeData, isLoading: incomeLoading } = useIncomes({
    from: startDate ?? defaultFrom,
    to: endDate ?? defaultTo,
    walletId: storeFilters.walletId,
    page: 0,
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

  const recent = mixed.slice(0, 5)
  const hasMore = mixed.length > 5

  return (
    <div className="mx-auto max-w-3xl">
      <WalletCarousel selectedWalletId={storeFilters.walletId} onSelect={handleWalletSelect} />

      <QuickActions />

      <div className="px-4 pt-4">
        <SectionHeader title="Presupuestos" onAction={() => router.push('/budgets')} actionLabel="Ver todo" />
      </div>
      <BudgetCarousel />

      <div className="px-4 pt-5 pb-1">
        <SectionHeader
          title="Movimientos recientes"
          onAction={hasMore ? () => router.push('/transactions') : undefined}
          actionLabel="Ver todos"
        />
      </div>

      <FinanceFilters
        filters={activeFilters}
        setFilters={setActiveFilters}
        categories={categories}
      />

      <div className="mt-2 px-2 pb-4">
        {isLoading ? (
          <div className="overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title={storeFilters.walletId ? 'Sin registros en esta cuenta' : 'Sin registros en este período'}
            description="Usa los botones de arriba para registrar tu primer gasto o ingreso."
          />
        ) : (
          <TransactionList items={recent} />
        )}
      </div>
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
