'use client'

import { useEffect } from 'react'

import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

export function useActiveWallet(): number | undefined {
  const { data: wallets = [] } = useWallets()
  const stored = useFilterStore((s) => s.walletId)
  const setWalletId = useFilterStore((s) => s.setWalletId)

  const active = stored ?? wallets[0]?.id

  useEffect(() => {
    if (stored == null && active != null) setWalletId(active)
  }, [stored, active, setWalletId])

  return active
}