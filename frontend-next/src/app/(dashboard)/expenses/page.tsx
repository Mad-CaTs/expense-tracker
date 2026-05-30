'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

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
  const [expandedId, setExpandedId] = useState<number | null>(null)

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
            <motion.button
              onClick={() => router.push('/expenses/new')}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              <Plus size={12} />
              Nuevo
            </motion.button>
          }
        />

        <ExpenseFilters />

        <div className="mt-5 px-4">
          {isLoading ? (
            <div className="overflow-hidden rounded-[18px] border" style={{ borderColor: 'var(--border-subtle)' }}>
              {Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
            </div>
          ) : !data?.content.length ? (
            <EmptyState
              title="Sin gastos en este período"
              description="Registra tu primer gasto para comenzar."
            />
          ) : (
            <div
              className="overflow-hidden rounded-[18px] border divide-y divide-[var(--border-subtle)]"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}
            >
              {data.content.map((expense, i) => (
                <div key={expense.id}>
                  <ExpenseRow
                    expense={expense}
                    index={i}
                    expanded={expandedId === expense.id}
                    onToggle={() => setExpandedId(prev => prev === expense.id ? null : expense.id)}
                    onEdit={(id) => router.push(`/expenses/${id}/edit`)}
                    onDelete={(id) => setDeleteId(id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4">
            <button
              className="h-8 rounded-full border px-4 text-[11px] font-semibold transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              disabled={filters.currentPage === 0}
              onClick={() => filters.setPage(filters.currentPage - 1)}
            >
              ← Anterior
            </button>
            <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {filters.currentPage + 1} / {data.totalPages}
            </span>
            <button
              className="h-8 rounded-full border px-4 text-[11px] font-semibold transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
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
