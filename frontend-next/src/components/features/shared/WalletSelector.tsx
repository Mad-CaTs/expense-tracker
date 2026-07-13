'use client'

import { motion } from 'framer-motion'

import type { Wallet } from '@/types'

interface WalletSelectorProps {
  wallets?: Wallet[]
  selectedId: string
  error?: string
  onSelect: (walletId: string) => void
}

export function WalletSelector({ wallets, selectedId, error, onSelect }: WalletSelectorProps) {
  if (!wallets || wallets.length === 0) return null

  return (
    <div className="pt-2 pb-2">
      <div className="mx-4 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
      <div className="mb-3 flex items-center justify-between px-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Wallet
        </p>
        {error && (
          <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
        <div className="shrink-0 pl-4" />
        {wallets.map((w) => {
          const selected = selectedId === w.id.toString()
          const wColor = w.color ?? '#d4af37'
          return (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => onSelect(w.id.toString())}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex shrink-0 flex-col items-start justify-between rounded-2xl px-3 py-2.5 transition-colors"
              style={{
                minWidth: '110px',
                background: selected ? `${wColor}15` : 'var(--bg-input)',
                boxShadow: selected ? `0 0 0 1.5px ${wColor}60` : 'none',
              }}
            >
              <span className="mb-1 max-w-full truncate text-[12px] font-bold" style={{ color: selected ? wColor : 'var(--text-primary)' }}>
                {w.name}
              </span>
              <span className="font-mono text-[11px]" style={{ color: wColor }}>
                S/ {Number(w.balance).toFixed(2)}
              </span>
            </motion.button>
          )
        })}
        <div className="shrink-0 pr-4" />
      </div>
    </div>
  )
}
