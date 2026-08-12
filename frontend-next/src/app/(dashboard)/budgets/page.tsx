'use client'

import { Suspense } from 'react'

import { BudgetsScreen } from '@/components/features/budgets/BudgetsScreen'

export default function BudgetsPage() {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      {/* BudgetsScreen lee `?focus` para destacar el presupuesto que se abrió
          desde el carrusel de /expenses, y useSearchParams exige este límite. */}
      <Suspense>
        <BudgetsScreen />
      </Suspense>
    </div>
  )
}
