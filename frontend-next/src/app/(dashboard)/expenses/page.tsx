'use client'

import { useRouter } from 'next/navigation'

import { ExpenseFilters } from '@/components/features/expenses/ExpenseFilters'
import { ExpenseRow } from '@/components/features/expenses/ExpenseRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseRowSkeleton } from '@/components/ui/Skeleton'
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

  function handleDelete(id: number) {
    if (confirm('¿Eliminar este gasto?')) {
      deleteExpense.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="px-4 pt-6 pb-2 md:pt-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e0d5]">Gastos</h1>
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
        <div className="flex justify-center gap-2 p-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.currentPage === 0}
            onClick={() => filters.setPage(filters.currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="self-center text-xs text-[#555]">
            {filters.currentPage + 1} / {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.currentPage >= data.totalPages - 1}
            onClick={() => filters.setPage(filters.currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
