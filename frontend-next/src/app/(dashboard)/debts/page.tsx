'use client'

import { Suspense } from 'react'

import { DebtsScreen } from '@/components/features/debts/DebtsScreen'

export default function DebtsPage() {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl pb-8">
      {/* DebtsScreen lee `?dir` de la URL, y useSearchParams exige este límite
          de Suspense. */}
      <Suspense>
        <DebtsScreen />
      </Suspense>
    </div>
  )
}
