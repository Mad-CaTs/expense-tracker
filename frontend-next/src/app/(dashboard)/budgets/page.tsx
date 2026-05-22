'use client'

import { BudgetCard } from '@/components/features/budgets/BudgetCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { BudgetCardSkeleton } from '@/components/ui/Skeleton'
import { useBudgets } from '@/lib/hooks/useBudgets'

export default function BudgetsPage() {
  const { data, isLoading } = useBudgets()

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[#e2e0d5]">Presupuestos</h1>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BudgetCardSkeleton key={i} />)
        ) : !data?.length ? (
          <EmptyState
            title="Sin presupuestos"
            description="Define un presupuesto mensual para cada categoría."
          />
        ) : (
          data.map((budget, i) => <BudgetCard key={budget.id} budget={budget} index={i} />)
        )}
      </div>
    </div>
  )
}
