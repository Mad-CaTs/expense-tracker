'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ExpenseFilters } from '@/components/features/expenses/ExpenseFilters'
import { ExpenseRow } from '@/components/features/expenses/ExpenseRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDeleteExpense, useExpenses } from '@/lib/hooks/useExpenses'
import { useFilterStore } from '@/stores/filterStore'

export default function ExpensesPage() {
  const router = useRouter()
  const filters = useFilterStore()
  const { data, isLoading } = useExpenses({
    period: filters.period,
    categoryId: filters.categoryId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    page: filters.currentPage,
    size: 20,
  })
  const deleteExpense = useDeleteExpense()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  function confirmDelete() {
    if (deleteId != null) deleteExpense.mutate(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar este gasto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Mis Gastos"
          action={
            <button
              onClick={() => router.push('/expenses/new')}
              className="flex h-7 items-center gap-1 rounded-full bg-[#d4af37] px-3 text-[11px] font-bold text-[#080808]"
            >
              + Nuevo
            </button>
          }
        />

        <ExpenseFilters />

        <div className="mt-3 flex flex-col gap-3 px-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)
          ) : !data?.content.length ? (
            <EmptyState
              title="Sin gastos en este período"
              description="Registra tu primer gasto para comenzar."
            />
          ) : (
            data.content.map((expense, i) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                index={i}
                onEdit={(id) => router.push(`/expenses/${id}/edit`)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4">
            <button
              className="h-8 rounded-full border border-[#242424] px-4 text-[11px] font-semibold text-[#808080] disabled:opacity-30 hover:border-[#383838] hover:text-[#e8e6db] transition-colors"
              disabled={filters.currentPage === 0}
              onClick={() => filters.setPage(filters.currentPage - 1)}
            >
              ← Anterior
            </button>
            <span className="text-[11px] text-[#383838] tabular-nums">
              {filters.currentPage + 1} / {data.totalPages}
            </span>
            <button
              className="h-8 rounded-full border border-[#242424] px-4 text-[11px] font-semibold text-[#808080] disabled:opacity-30 hover:border-[#383838] hover:text-[#e8e6db] transition-colors"
              disabled={filters.currentPage >= data.totalPages - 1}
              onClick={() => filters.setPage(filters.currentPage + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
