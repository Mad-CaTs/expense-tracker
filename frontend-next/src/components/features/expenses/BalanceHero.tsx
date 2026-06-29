'use client'

import { useState } from 'react'

import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react'

import { MoneyText } from '@/components/ui/MoneyText'
import { walletGrowth } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'

interface BalanceHeroProps {
  wallets: Wallet[]
  selectedWalletId?: number
}

export function BalanceHero({ wallets, selectedWalletId }: BalanceHeroProps) {
  const [hidden, setHidden] = useState(false)

  const selected = selectedWalletId != null ? wallets.find((w) => w.id === selectedWalletId) : undefined

  const balance = selected
    ? Number(selected.balance)
    : wallets.reduce((sum, w) => sum + Number(w.balance), 0)

  const initial = selected
    ? Number(selected.initialBalance)
    : wallets.reduce((sum, w) => sum + Number(w.initialBalance), 0)

  const label = selected ? selected.name.toUpperCase() : 'BALANCE TOTAL'
  const growth = walletGrowth(balance, initial)

  return (
    <div className="px-4 pt-4 pb-5">
      <div className="mb-1 flex items-center justify-between">
        <p className="t-label uppercase tracking-[0.14em]" style={{ color: 'var(--text-placeholder)' }}>
          {label}
        </p>
        <button
          onClick={() => setHidden((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
        >
          {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      <MoneyText amount={balance} kind="neutral" hidden={hidden} className="t-display" />

      {growth && !hidden && (
        <div className="mt-2 flex items-center gap-1">
          {growth.positive
            ? <TrendingUp size={13} style={{ color: 'var(--success)' }} />
            : <TrendingDown size={13} style={{ color: 'var(--danger)' }} />}
          <span className="t-caption font-semibold tabular-nums" style={{ color: growth.positive ? 'var(--success)' : 'var(--danger)' }}>
            {growth.positive ? '+' : ''}{growth.pct}%
          </span>
          <span className="t-caption" style={{ color: 'var(--text-muted)' }}>vs saldo inicial</span>
        </div>
      )}
    </div>
  )
}
