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

  const hasSkin = !!wallet.backgroundUrl
  const skinStyle = hasSkin
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.65)), url(${wallet.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: 'var(--bg-card-inner)' }

  const nameColor = hasSkin ? 'rgba(255,255,255,0.75)' : 'var(--text-placeholder)'
  const balanceColor = hasSkin ? '#fff' : 'var(--text-primary)'
  const pctColor = positive
    ? hasSkin ? '#7ee0a0' : 'var(--success)'
    : hasSkin ? '#ff9a9a' : 'var(--danger)'

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex-shrink-0 w-full rounded-[22px] text-left overflow-hidden"
      style={{
        boxShadow: selected
          ? `0 0 0 2px ${hasSkin ? '#fff4' : accent}`
          : '0 0 0 1px var(--border-subtle)',
      }}
    >
      <div
        className="rounded-[22px] px-5 py-5"
        style={{
          ...skinStyle,
          boxShadow: !hasSkin && selected
            ? `inset 0 0 0 1px ${accent}50, var(--inset-highlight)`
            : hasSkin ? undefined : 'var(--inset-highlight)',
        }}
      >
        {/* Top row: name left, pct right */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase" style={{ color: nameColor }}>
            {wallet.name}
          </p>

          {pct !== null && (
            <div className="flex items-center gap-1">
              {positive
                ? <TrendingUp size={11} style={{ color: pctColor }} />
                : <TrendingDown size={11} style={{ color: pctColor }} />
              }
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: pctColor }}>
                {positive ? '+' : ''}{pct}%
              </span>
              <span className="text-[10px]" style={{ color: hasSkin ? 'rgba(255,255,255,0.5)' : 'var(--text-placeholder)' }}>
                vs inicial
              </span>
            </div>
          )}
        </div>

        {/* Balance */}
        <p
          className="mono-amount text-[38px] font-extrabold leading-none tracking-[-0.02em]"
          style={{ color: balanceColor }}
        >
          S/ {formatBalance(balance)}
        </p>

        {/* Dot indicador seleccionado */}
        {selected && (
          <div className="mt-4 flex justify-center">
            <span className="h-1.5 w-6 rounded-full" style={{ background: hasSkin ? 'rgba(255,255,255,0.6)' : accent }} />
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
