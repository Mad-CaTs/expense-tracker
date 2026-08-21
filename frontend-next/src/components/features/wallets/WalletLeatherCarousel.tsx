'use client'

import { useRef, useState } from 'react'
import { preload } from 'react-dom'

import { useReducedMotion } from 'framer-motion'

import { WalletBalanceAmount } from '@/components/features/wallets/WalletBalanceAmount'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWallets } from '@/lib/hooks/useWallets'
import { categoryHueSat } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'

import { LEATHERS, leatherSrc, type LeatherId } from './leathers'
import { LeatherWallet } from './LeatherWallet'

export type LeatherTheme = LeatherId
export const LEATHER_SRC: Record<LeatherId, string> = Object.fromEntries(
  LEATHERS.map((l) => [l.id, leatherSrc(l.id)]),
) as Record<LeatherId, string>
const CARD_SRC = '/wallets/card.webp'

export function themeForColor(color?: string): LeatherTheme {
  if (!color) return 'green'
  const { h } = categoryHueSat(color)
  if (h >= 75 && h <= 175) return 'green'
  if (h >= 30 && h < 75) return 'tan'
  return 'brown'
}

function titleCase(name: string) {
  if (name !== name.toUpperCase()) return name
  return name
    .toLocaleLowerCase('es-PE')
    .replace(/(^|\s)\p{L}/gu, (c) => c.toLocaleUpperCase('es-PE'))
}

type Pos = '0' | '-1' | '1' | 'hidden-l' | 'hidden-r'

const POS_STYLE: Record<Pos, React.CSSProperties> = {
  '0': { transform: 'translateX(0) scale(1) rotateY(0deg)', opacity: 1, filter: 'blur(0px)', zIndex: 10 },
  '-1': { transform: 'translateX(-117px) scale(0.85) rotateY(10deg)', opacity: 0.35, filter: 'blur(3px)', zIndex: 5 },
  '1': { transform: 'translateX(117px) scale(0.85) rotateY(-10deg)', opacity: 0.35, filter: 'blur(3px)', zIndex: 5 },
  'hidden-l': { transform: 'translateX(-200px) scale(0.7)', opacity: 0, zIndex: 1, pointerEvents: 'none' },
  'hidden-r': { transform: 'translateX(200px) scale(0.7)', opacity: 0, zIndex: 1, pointerEvents: 'none' },
}

const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DURATION = 460

const DOT_DURATION = 260

const SWIPE_THRESHOLD = 45

export interface WalletLeatherCarouselProps {
  onOpenActive?: (wallet: Wallet, els: { walletEl: HTMLElement; cardEl: HTMLElement }) => void
}

export function WalletLeatherCarousel({ onOpenActive }: WalletLeatherCarouselProps = {}) {
  preload(CARD_SRC, { as: 'image' })
  for (const src of Object.values(LEATHER_SRC)) preload(src, { as: 'image' })

  const { data: wallets = [], isLoading } = useWallets()
  const [rawCurrent, setCurrent] = useState(0)
  const [pressed, setPressed] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const total = wallets.length
  const current = total > 0 ? Math.min(rawCurrent, total - 1) : 0
  const dragging = useRef(false)
  const moved = useRef(false)
  const startX = useRef(0)

  function posOf(i: number): Pos {
    let pos = (i - current + total) % total
    if (pos > Math.floor(total / 2)) pos -= total
    if (pos === 0) return '0'
    if (pos === -1) return '-1'
    if (pos === 1) return '1'
    return pos < 0 ? 'hidden-l' : 'hidden-r'
  }

  const next = () => setCurrent((c) => (c + 1) % total)
  const prev = () => setCurrent((c) => (c - 1 + total) % total)

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    moved.current = false
    startX.current = e.clientX
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    if (Math.abs(e.clientX - startX.current) > 4) moved.current = true
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return
    dragging.current = false
    const dx = e.clientX - startX.current
    if (dx <= -SWIPE_THRESHOLD) next()
    else if (dx >= SWIPE_THRESHOLD) prev()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-190px)] flex-col items-center justify-center gap-6">
        <div className="h-4 w-28 animate-pulse rounded-full" style={{ background: 'var(--skeleton-from)' }} />
        <div
          className="animate-pulse rounded-[22px]"
          style={{ width: 260, height: 215, background: 'var(--skeleton-from)' }}
        />
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="flex min-h-[calc(100vh-190px)] items-center justify-center px-2">
        <EmptyState
          title="Aún no tienes billeteras"
          description="Crea una para empezar a registrar tus movimientos y ver tu saldo."
        />
      </div>
    )
  }

  const activeWallet = wallets[current]

  return (
    <div className="flex min-h-[calc(100vh-190px)] flex-col">
      {/* Identidad de la billetera activa. El nombre manda; el saldo lo sigue.
          El saldo recorre hasta su nuevo valor cuando cambia (registrar un
          gasto, un ingreso, una transferencia), no al deslizar entre
          billeteras — ver WalletBalanceAmount.
          aria-live: al deslizar, el lector de pantalla anuncia el cambio. */}
      <div className="pt-5 pb-1 text-center" aria-live="polite" aria-atomic="true">
        <p className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
          {titleCase(activeWallet.name)}
        </p>
        <p className="mt-1.5 text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
          <small className="mr-1 text-[22px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</small>
          <WalletBalanceAmount walletId={activeWallet.id} balance={Number(activeWallet.balance)} />
        </p>
      </div>

      {/* Escenario coverflow — centrado en el espacio restante */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ minHeight: 320, perspective: '1000px', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => { setPressed(null); onPointerUp(e) }}
        onPointerCancel={(e) => { setPressed(null); onPointerUp(e) }}
      >
        {wallets.map((w, i) => {
          const pos = posOf(i)
          const isActive = pos === '0'
          const base = POS_STYLE[pos]
          const press = pressed === i && !isActive ? ' scale(0.97)' : ''
          return (
            <div
              key={w.id}
              className="absolute left-1/2 top-1/2 flex items-end justify-center"
              style={{
                width: 260,
                height: 291,
                margin: '-145px 0 0 -130px',
                paddingTop: 76,
                cursor: 'pointer',
                willChange: 'transform, opacity, filter',
                ...base,
                transform: reduce ? 'none' : `${base.transform}${press}`,
                transition: reduce
                  ? `opacity ${DURATION}ms ${EASE_OUT}`
                  : press
                    ? `transform 120ms ease-out, opacity ${DURATION}ms ${EASE_OUT}, filter ${DURATION}ms ${EASE_OUT}`
                    : `transform ${DURATION}ms ${EASE_OUT}, opacity ${DURATION}ms ${EASE_OUT}, filter ${DURATION}ms ${EASE_OUT}`,
              }}
              onPointerDown={() => { if (!isActive) setPressed(i) }}
              onPointerLeave={() => setPressed(null)}
              onClick={(e) => {
                if (moved.current) return
                if (!isActive) {
                  setCurrent(i)
                  return
                }
                const walletEl = e.currentTarget.querySelector<HTMLElement>('[data-wallet-visual]')
                const cardEl = e.currentTarget.querySelector<HTMLElement>('[data-wallet-card]')
                if (walletEl && cardEl) onOpenActive?.(w, { walletEl, cardEl })
              }}
            >
              <LeatherWallet wallet={w} active={isActive} />
            </div>
          )
        })}
      </div>

      {/* Indicador de posición — separación como el carrusel de Home. */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 pb-1 pt-6">
          {wallets.map((w, i) => (
            <button
              key={w.id}
              type="button"
              aria-label={`Ver ${w.name}`}
              aria-current={i === current}
              onClick={() => setCurrent(i)}
              className="block rounded-full"
              style={{
                height: 6,
                width: i === current ? 16 : 6,
                background: i === current ? 'var(--accent)' : 'var(--border-strong)',
                transition: reduce ? 'none' : `width ${DOT_DURATION}ms ${EASE_OUT}, background ${DOT_DURATION}ms ${EASE_OUT}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
