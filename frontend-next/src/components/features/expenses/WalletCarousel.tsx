'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
// useTransform kept for rotateX/rotateY tilt
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

  // Spring-based tilt — only on pointer devices, decorative
  const cardRef = useRef<HTMLButtonElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springConfig = { stiffness: 180, damping: 22 }
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), springConfig)
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), springConfig)

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rawX.set(x)
    rawY.set(y)
  }

  function handleMouseLeave() {
    rawX.set(0)
    rawY.set(0)
  }

  const skinStyle = hasSkin
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%), url(${wallet.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: 'var(--bg-card-inner)' }

  const nameColor = hasSkin ? 'rgba(255,255,255,0.78)' : 'var(--text-placeholder)'
  const balanceColor = hasSkin ? '#fff' : 'var(--text-primary)'
  const pctColor = positive
    ? hasSkin ? '#7ee0a0' : 'var(--success)'
    : hasSkin ? '#ff9a9a' : 'var(--danger)'

  const selectionRing = selected
    ? hasSkin
      ? `0 0 0 2px rgba(255,255,255,0.55), 0 20px 48px -12px rgba(0,0,0,0.6)`
      : `0 0 0 2px ${accent}, 0 16px 40px -12px ${accent}55`
    : hasSkin
      ? '0 8px 24px -8px rgba(0,0,0,0.4)'
      : '0 0 0 1px var(--border-subtle)'

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      animate={{
        y: 0,
        scale: selected ? 1.01 : 1,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        boxShadow: selectionRing,
      }}
      className="relative flex-shrink-0 w-full rounded-[22px] text-left overflow-hidden"
    >
      <div className="rounded-[22px] px-5 py-5" style={skinStyle}>

        {/* Top row */}
        <div className="flex items-center justify-between mb-3 relative">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: nameColor }}>
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
              <span className="text-[10px]" style={{ color: hasSkin ? 'rgba(255,255,255,0.45)' : 'var(--text-placeholder)' }}>
                vs inicial
              </span>
            </div>
          )}
        </div>

        {/* Balance */}
        <p
          className="mono-amount text-[38px] font-extrabold leading-none tracking-[-0.02em] relative"
          style={{ color: balanceColor }}
        >
          S/ {formatBalance(balance)}
        </p>

        {/* Selection dot — animated */}
        <div className="mt-4 flex justify-center" style={{ minHeight: '10px' }}>
          <AnimatePresence>
            {selected && (
              <motion.span
                key="dot"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="h-1.5 rounded-full block"
                style={{
                  width: '24px',
                  background: hasSkin ? 'rgba(255,255,255,0.65)' : accent,
                  transformOrigin: 'center',
                }}
              />
            )}
          </AnimatePresence>
        </div>
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const scrolledRef = useRef(false)

  useEffect(() => {
    if (!selectedWalletId || scrolledRef.current || wallets.length === 0) return
    const el = cardRefs.current.get(selectedWalletId)
    const container = scrollRef.current
    if (!el || !container) return
    scrolledRef.current = true
    const elLeft = el.offsetLeft
    const elWidth = el.offsetWidth
    const containerWidth = container.offsetWidth
    container.scrollTo({ left: elLeft - (containerWidth - elWidth) / 2, behavior: 'smooth' })
  }, [selectedWalletId, wallets])

  return (
    <>
    <div className="pt-2 pb-1">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pt-1 pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          perspective: '1000px',
        }}
      >
        {wallets.map((w) => (
          <div
            key={w.id}
            ref={(el) => { if (el) cardRefs.current.set(w.id, el); else cardRefs.current.delete(w.id) }}
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
            <motion.span
              key={w.id}
              className="rounded-full block"
              animate={{
                width: selectedWalletId === w.id ? 16 : 6,
                background: selectedWalletId === w.id
                  ? (w.color ?? 'var(--accent-light)')
                  : 'var(--border-strong)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ height: '6px' }}
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
