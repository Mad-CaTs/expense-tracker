'use client'

import { Suspense } from 'react'

import { AnalyticsScreen } from '@/components/features/reports/AnalyticsScreen'

export default function AnalyticsPage() {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      {/* AnalyticsScreen lee `?type` y `?g` de la URL, y useSearchParams exige
          este límite de Suspense. */}
      <Suspense>
        <AnalyticsScreen />
      </Suspense>
    </div>
  )
}
