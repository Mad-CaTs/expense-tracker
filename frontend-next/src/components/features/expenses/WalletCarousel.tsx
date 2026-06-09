'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'

import { WalletSheet } from '@/components/features/expenses/WalletSheet'
import { useWallets } from '@/lib/hooks/useWallets'
import type { Wallet } from '@/types'

function formatBalance(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function WalletCard({
  wallet,
  selected,
  onSelect,
}: {
  wallet: Wallet
  selected: boolean
  onSelect: () => void
}) {
  const accent = wallet.color ?? '#d4af37'
  const balance = Number(wallet.balance)
  const initial = Number(wallet.initialBalance)
  const diff = balance - initial
  const pct = initial !== 0 ? ((diff / Math.abs(initial)) * 100).toFixed(1) : null
  const positive = diff >= 0

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex-shrink-0 w-full rounded-[22px] border p-[1px] text-left"
      style={{
        borderColor: selected ? accent : 'var(--border-subtle)',
        background: 'var(--bg-subtle)',
      }}
    >
      <div
        className="rounded-[21px] px-5 py-5"
        style={{
          background: 'var(--bg-card-inner)',
          boxShadow: selected
            ? `inset 0 0 0 1px ${accent}50, var(--inset-highlight)`
            : 'var(--inset-highlight)',
        }}
      >
        {/* Top row: name left, pct right */}
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--text-placeholder)' }}
          >
            {wallet.name}
          </p>

          {pct !== null && (
            <div className="flex items-center gap-1">
              {positive
                ? <TrendingUp size={11} style={{ color: 'var(--success)' }} />
                : <TrendingDown size={11} style={{ color: 'var(--danger)' }} />
              }
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: positive ? 'var(--success)' : 'var(--danger)' }}
              >
                {positive ? '+' : ''}{pct}%
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
                vs inicial
              </span>
            </div>
          )}
        </div>

        {/* Balance alineado a la izquierda */}
        <p
          className="mono-amount text-[38px] font-extrabold leading-none tracking-[-0.02em]"
          style={{ color: 'var(--text-primary)' }}
        >
          S/ {formatBalance(balance)}
        </p>

        {/* Dot indicador seleccionado */}
        {selected && (
          <div className="mt-4 flex justify-center">
            <span className="h-1.5 w-6 rounded-full" style={{ background: accent }} />
          </div>
        )}
      </div>
    </motion.button>
  )
}

function AddWalletCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex-shrink-0 w-[140px] rounded-[22px] border border-dashed flex flex-col items-center justify-center gap-2 py-8"
      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-placeholder)' }}
    >
      <Plus size={20} />
      <span className="text-[12px] font-medium">Nuevo wallet</span>
    </motion.button>
  )
}

interface WalletCarouselProps {
  selectedWalletId?: number
  onSelect: (id: number | undefined) => void
}

export function WalletCarousel({ selectedWalletId, onSelect }: WalletCarouselProps) {
  const { data: wallets = [] } = useWallets()
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
    <div className="pt-2 pb-1">
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {wallets.map((w) => (
          <div
            key={w.id}
            className="flex-shrink-0"
            style={{ width: 'calc(100vw - 2rem)', maxWidth: '480px' }}
          >
            <WalletCard
              wallet={w}
              selected={selectedWalletId === w.id}
              onSelect={() => onSelect(selectedWalletId === w.id ? undefined : w.id)}
            />
          </div>
        ))}

        <AddWalletCard onClick={() => setShowSheet(true)} />
      </div>

      {/* Dots paginación */}
      {wallets.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {wallets.map((w) => (
            <span
              key={w.id}
              className="rounded-full transition-all"
              style={{
                width: selectedWalletId === w.id ? '16px' : '6px',
                height: '6px',
                background: selectedWalletId === w.id
                  ? (w.color ?? 'var(--accent-light)')
                  : 'var(--border-strong)',
              }}
            />
          ))}
        </div>
      )}
    </div>

    <AnimatePresence>
      {showSheet && <WalletSheet onClose={() => setShowSheet(false)} />}
    </AnimatePresence>
    </>
  )
}
