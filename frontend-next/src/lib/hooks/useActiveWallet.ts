'use client'

import { useEffect } from 'react'

import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

export function useActiveWallet(): number | undefined {
  const { data: wallets = [], isSuccess } = useWallets()
  const stored = useFilterStore((s) => s.walletId)
  const setWalletId = useFilterStore((s) => s.setWalletId)
  const storedExists = stored != null && wallets.some((w) => w.id === stored)
  const active = storedExists ? stored : wallets[0]?.id

  useEffect(() => {
    if (!isSuccess || active == null || stored === active) return
    setWalletId(active)
  }, [isSuccess, stored, active, setWalletId])

  return active
}