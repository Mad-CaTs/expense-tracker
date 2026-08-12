'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
// useTransform kept for rotateX/rotateY tilt
import { Eye, EyeOff, History, Plus, TrendingDown, TrendingUp } from 'lucide-react'

import { WalletSheet } from '@/components/features/expenses/WalletSheet'
import { WalletBalanceAmount } from '@/components/features/wallets/WalletBalanceAmount'
import { useWallets } from '@/lib/hooks/useWallets'
import { categoryAura } from '@/lib/utils/cardVisuals'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { Wallet } from '@/types'

// Logo de la app (asset local optimizado; antes bucket externo R2)
const LOGO_URL = '/brand/logo.webp'

function WalletCard({
  wallet,
  selected,
  hidden,
  index,
  onToggleHidden,
  onSelect,
  onShowMovements,
}: {
  wallet: Wallet
  selected: boolean
  hidden: boolean
  index: number
  onToggleHidden: () => void
  onSelect: () => void
  onShowMovements: () => void
}) {
  const balance = Number(wallet.balance)
  const initial = Number(wallet.initialBalance)
  const diff = balance - initial
  const pct = initial !== 0 ? ((diff / Math.abs(initial)) * 100).toFixed(1) : null
  const positive = diff >= 0

  // Aurora animada derivada del color del wallet, en el tono atenuado de la app
  const aura = categoryAura(wallet.color ?? '#d4af37')

  // Spring-based tilt — only on pointer devices, decorative
  const cardRef = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springConfig = { stiffness: 180, damping: 22 }
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [3, -3]), springConfig)
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-4, 4]), springConfig)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
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

  // Anillo de selección dorado; sin borde ni sombra cuando no está seleccionada
  const boxShadow = selected ? '0 0 0 2px var(--accent)' : 'none'

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: MOTION_S.press, ease: EASE }}
      style={{
        rotateX,
        rotateY,
        boxShadow,
        ['--enter-i' as string]: index,
      }}
      className="enter-pop relative flex-shrink-0 w-full rounded-[22px] text-left cursor-pointer"
    >
      <div
        className="relative rounded-[22px] overflow-hidden"
        style={{ background: aura.base }}
      >
        {/* Aurora animada (blobs difuminados) */}
        <div className="wallet-aura aura-soft" aria-hidden>
          <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
          <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
          <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
          <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
        </div>

        {/* Contenido (texto blanco sobre el gradiente) */}
        <div className="relative z-[1] p-[22px] flex flex-col" style={{ minHeight: '188px' }}>
          {/* Top row: logo + growth badge */}
          <div className="flex items-start justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt=""
              aria-hidden
              decoding="async"
              style={{
                width: '54px',
                height: '36px',
                objectFit: 'contain',
                objectPosition: 'left center',
                filter: 'invert(1)',
                opacity: 0.92,
              }}
            />

            {pct !== null && (
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
              >
                {positive
                  ? <TrendingUp size={12} style={{ color: '#fff' }} strokeWidth={2.6} />
                  : <TrendingDown size={12} style={{ color: '#fff' }} strokeWidth={2.6} />
                }
                <span className="text-[12px] font-bold tabular-nums leading-none" style={{ color: '#fff' }}>
                  {positive ? '+' : ''}{pct}%
                </span>
              </div>
            )}
          </div>

          {/* Spacer empuja el contenido a la parte baja (como el demo) */}
          <div className="flex-1 min-h-[28px]" />

          {/* Label (nombre) + ojo de privacidad */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[15px] font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {wallet.name}
            </span>
            <button
              type="button"
              aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onToggleHidden() }}
              className="flex h-5 w-5 items-center justify-center transition-opacity hover:opacity-70 active:scale-90 cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {hidden ? <Eye size={17} strokeWidth={2} /> : <EyeOff size={17} strokeWidth={2} />}
            </button>
          </div>

          {/* Balance (héroe) + botón movimientos */}
          <div className="flex items-end justify-between gap-3">
            <p
              className="text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums"
              style={{ color: '#fff', textShadow: '0 1px 18px rgba(0,0,0,0.25)' }}
            >
              {hidden ? (
                'S/ ••••••'
              ) : (
                <>
                  S/{' '}
                  <WalletBalanceAmount walletId={wallet.id} balance={balance} />
                </>
              )}
            </p>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onShowMovements() }}
              className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-[14px] px-3.5 transition-transform active:scale-95 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff' }}
            >
              <History size={14} strokeWidth={2} />
              <span className="text-[13px] font-medium">Historial</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AddWalletCard({ onClick, full = false }: { onClick: () => void; full?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: MOTION_S.press, ease: EASE }}
      className={`${full ? 'w-full' : 'flex-shrink-0 w-[140px]'} rounded-[18px] border border-dashed flex flex-col items-center justify-center gap-2 py-8`}
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
  const router = useRouter()
  const { data: wallets = [] } = useWallets()
  const [showSheet, setShowSheet] = useState(false)
  const [hidden, setHidden] = useState(false)
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
    <div className="pt-5 pb-1">
      {wallets.length === 0 ? (
        <div className="px-4 pt-1 pb-2">
          <AddWalletCard onClick={() => setShowSheet(true)} full />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 pt-1 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            perspective: '1000px',
          }}
        >
          {wallets.map((w, i) => (
            <div
              key={w.id}
              ref={(el) => { if (el) cardRefs.current.set(w.id, el); else cardRefs.current.delete(w.id) }}
              className="flex-shrink-0"
              style={{ width: 'calc(100vw - 2rem)', maxWidth: '480px' }}
            >
              <WalletCard
                wallet={w}
                selected={selectedWalletId === w.id}
                hidden={hidden}
                index={i}
                onToggleHidden={() => setHidden((v) => !v)}
                onSelect={() => onSelect(selectedWalletId === w.id ? undefined : w.id)}
                // Al detalle de la billetera en /wallets, donde vive su lista
                // de movimientos: acá "Historial" solo filtraba la página.
                onShowMovements={() => router.push(`/wallets?w=${w.id}`)}
              />
            </div>
          ))}
        </div>
      )}

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
              transition={{ duration: MOTION_S.tint, ease: EASE }}
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
