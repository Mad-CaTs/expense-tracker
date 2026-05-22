'use client'

import { useRouter } from 'next/navigation'

import { ExpenseFilters } from '@/components/features/expenses/ExpenseFilters'
import { ExpenseRow } from '@/components/features/expenses/ExpenseRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
import { useDeleteExpense, useExpenses } from '@/lib/hooks/useExpenses'
import { useFilterStore } from '@/stores/filterStore'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

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

  function handleDelete(id: number) {
    if (confirm('¿Eliminar este gasto?')) {
      deleteExpense.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-end justify-between px-4 pt-7 pb-4 md:pt-9">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#383838] uppercase">
            {getGreeting()}
          </p>
          <h1 className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em] text-[#e8e6db]">
            Mis Gastos
          </h1>
        </div>
        <Button size="sm" onClick={() => router.push('/expenses/new')}>
          + Nuevo
        </Button>
      </div>

      <ExpenseFilters />

      <div>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ExpenseRowSkeleton key={i} />)
        ) : !data?.content.length ? (
          <EmptyState
            title="Sin gastos en este período"
            description="Registra tu primer gasto para comenzar."
            action={
              <Button size="sm" onClick={() => router.push('/expenses/new')}>
                + Nuevo gasto
              </Button>
            }
          />
        ) : (
          data.content.map((expense, i) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              index={i}
              onEdit={(id) => router.push(`/expenses/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 p-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.currentPage === 0}
            onClick={() => filters.setPage(filters.currentPage - 1)}
          >
            ← Anterior
          </Button>
          <span className="text-[11px] text-[#383838] tabular-nums">
            {filters.currentPage + 1} / {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.currentPage >= data.totalPages - 1}
            onClick={() => filters.setPage(filters.currentPage + 1)}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  )
}
