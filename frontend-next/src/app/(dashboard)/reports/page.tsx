'use client'

import { Suspense } from 'react'

import { ReportsScreen } from '@/components/features/reports/ReportsScreen'

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsScreen />
    </Suspense>
  )
}