'use client'

import { Suspense } from 'react'

import { WalletsScreen } from '@/components/features/wallets/WalletsScreen'

export default function WalletsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="px-4 pb-8">
        {/* WalletsScreen lee ?w=<id> para restaurar el detalle abierto. */}
        <Suspense>
          <WalletsScreen />
        </Suspense>
      </div>
    </div>
  )
}
