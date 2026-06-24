'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { WalletStack } from '@/components/features/wallets/WalletStack'

export default function WalletsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Cuentas" />
      <div className="px-4 pb-8">
        <WalletStack />
      </div>
    </div>
  )
}
