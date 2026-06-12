'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { motion } from 'framer-motion'

import { WalletCarousel } from '@/components/features/expenses/WalletCarousel'
import { BudgetCarousel } from '@/components/features/expenses/BudgetCarousel'
import { ExpenseRow } from '@/components/features/expenses/ExpenseRow'
import { IncomeRow } from '@/components/features/incomes/IncomeRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
import { FinanceFilters, FinanceFilterType, DatePreset, TxType, applyFinanceFilters, type FinanceFilter } from '@/components/ui/finance-filters'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDeleteExpense, useExpenses } from '@/lib/hooks/useExpenses'
import { useDeleteIncome, useIncomes } from '@/lib/hooks/useIncomes'
import { useCategories } from '@/lib/hooks/useCategories'
import { useFilterStore } from '@/stores/filterStore'

function ExpensesPageInner() {
  const router = useRouter()
  useSearchParams()
  const storeFilters = useFilterStore()
  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null)
  const [deleteIncomeId, setDeleteIncomeId] = useState<number | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FinanceFilter[]>([
    { id: 'default-date', type: FinanceFilterType.FECHA, value: [DatePreset.THIS_MONTH] },
    { id: 'default-tipo', type: FinanceFilterType.TIPO, value: [TxType.ALL] },
  ])

  const { data: categories } = useCategories()

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
  const deleteExpense = useDeleteExpense()

  const { data: incomeData, isLoading: incomeLoading } = useIncomes({
    from: startDate ?? defaultFrom,
    to: endDate ?? defaultTo,
    walletId: storeFilters.walletId,
    page: storeFilters.currentPage,
    size: 20,
  })
  const deleteIncome = useDeleteIncome()

  function handleWalletSelect(id: number | undefined) {
    storeFilters.setWalletId(id)
    storeFilters.setPage(0)
    setExpandedKey(null)
  }

  const isLoading = expenseLoading || incomeLoading

  // Merge and sort by date desc
  type MixedItem =
    | { kind: 'expense'; id: number; date: string; index: number }
    | { kind: 'income'; id: number; date: string; index: number }

  const expenses = expenseData?.content ?? []
  const incomes = incomeData?.content ?? []

  const mixed: MixedItem[] = [
    ...(txType !== 'income' ? expenses.map((e, i) => ({ kind: 'expense' as const, id: e.id, date: e.date, index: i })) : []),
    ...(txType !== 'expense' ? incomes.map((e, i) => ({ kind: 'income' as const, id: e.id, date: e.date, index: i })) : []),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const totalExpensePages = expenseData?.totalPages ?? 0
  const totalIncomePages = incomeData?.totalPages ?? 0
  const totalPages = Math.max(totalExpensePages, totalIncomePages)

  const expenseMap = Object.fromEntries(expenses.map(e => [e.id, e]))
  const incomeMap = Object.fromEntries(incomes.map(e => [e.id, e]))

  return (
    <>
      <ConfirmDialog
        open={deleteExpenseId != null}
        title="¿Eliminar este gasto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteExpenseId != null) deleteExpense.mutate(deleteExpenseId); setDeleteExpenseId(null) }}
        onCancel={() => setDeleteExpenseId(null)}
      />
      <ConfirmDialog
        open={deleteIncomeId != null}
        title="¿Eliminar este ingreso?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteIncomeId != null) deleteIncome.mutate(deleteIncomeId); setDeleteIncomeId(null) }}
        onCancel={() => setDeleteIncomeId(null)}
      />

      <div className="mx-auto max-w-3xl">
        <PageHeader title="Mis Finanzas" />

        <WalletCarousel selectedWalletId={storeFilters.walletId} onSelect={handleWalletSelect} />
        <BudgetCarousel />

        <div className="mx-4 mt-2 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />

        <div className="px-4 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Historial
          </p>
        </div>

        <FinanceFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          categories={categories}
        />

        <div className="mt-2 px-4">
          {isLoading ? (
            <div className="overflow-hidden rounded-[18px] border" style={{ borderColor: 'var(--border-subtle)' }}>
              {Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
            </div>
          ) : mixed.length === 0 ? (
            <EmptyState
              title={storeFilters.walletId ? 'Sin registros en este wallet' : 'Sin registros en este período'}
              description="Registra tu primer gasto o ingreso para comenzar."
            />
          ) : (
            <div
              className="overflow-hidden rounded-[18px] border"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}
            >
              {mixed.map((item, listIndex) => {
                const key = `${item.kind}-${item.id}`
                if (item.kind === 'expense') {
                  const expense = expenseMap[item.id]
                  if (!expense) return null
                  return (
                    <div key={key} style={listIndex > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}>
                      <ExpenseRow
                        expense={expense}
                        index={item.index}
                        expanded={expandedKey === key}
                        onToggle={() => setExpandedKey(prev => prev === key ? null : key)}
                        onEdit={(id) => router.push(`/expenses/${id}/edit`)}
                        onDelete={(id) => setDeleteExpenseId(id)}
                      />
                    </div>
                  )
                } else {
                  const income = incomeMap[item.id]
                  if (!income) return null
                  return (
                    <div key={key} style={listIndex > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}>
                      <IncomeRow
                        income={income}
                        index={item.index}
                        expanded={expandedKey === key}
                        onToggle={() => setExpandedKey(prev => prev === key ? null : key)}
                        onEdit={(id) => router.push(`/incomes/${id}/edit`)}
                        onDelete={(id) => setDeleteIncomeId(id)}
                      />
                    </div>
                  )
                }
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4">
            <button
              className="h-8 rounded-full border px-4 text-[11px] font-semibold disabled:opacity-30"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              disabled={storeFilters.currentPage === 0}
              onClick={() => storeFilters.setPage(storeFilters.currentPage - 1)}
            >
              ← Anterior
            </button>
            <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {storeFilters.currentPage + 1} / {totalPages}
            </span>
            <button
              className="h-8 rounded-full border px-4 text-[11px] font-semibold disabled:opacity-30"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              disabled={storeFilters.currentPage >= totalPages - 1}
              onClick={() => storeFilters.setPage(storeFilters.currentPage + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesPageInner />
    </Suspense>
  )
}
