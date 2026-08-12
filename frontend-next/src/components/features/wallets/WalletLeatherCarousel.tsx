'use client'

import { useRef, useState } from 'react'
import { preload } from 'react-dom'

import { useReducedMotion } from 'framer-motion'

import { WalletBalanceAmount } from '@/components/features/wallets/WalletBalanceAmount'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWallets } from '@/lib/hooks/useWallets'
import { categoryHueSat } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'

/** Los 3 temas de cuero disponibles (assets en public/wallets, WebP al tamaño de render ×3). */
export type LeatherTheme = 'green' | 'brown' | 'tan'
export const LEATHER_SRC: Record<LeatherTheme, string> = {
  green: '/wallets/wallet-green.webp',
  brown: '/wallets/wallet-brown.webp',
  tan: '/wallets/wallet-tan.webp',
}
const CARD_SRC = '/wallets/card.webp'

/** Mapea el color del wallet al tema de cuero más cercano por su matiz (hue). */
export function themeForColor(color?: string): LeatherTheme {
  if (!color) return 'green'
  const { h } = categoryHueSat(color)
  // verde ~80-170, tan/ámbar ~35-65, marrón el resto (rojizos/naranjas oscuros)
  if (h >= 75 && h <= 175) return 'green'
  if (h >= 30 && h < 75) return 'tan'
  return 'brown'
}

/** Los nombres llegan como el usuario los escribió ("AHORROS"). Se muestran legibles. */
function titleCase(name: string) {
  if (name !== name.toUpperCase()) return name
  return name
    .toLocaleLowerCase('es-PE')
    .replace(/(^|\s)\p{L}/gu, (c) => c.toLocaleUpperCase('es-PE'))
}

/** Estado de posición coverflow de cada slot. */
type Pos = '0' | '-1' | '1' | 'hidden-l' | 'hidden-r'

/** Una billetera de cuero: composición de 3 capas (calibrada con render PIL). */
function LeatherWallet({ wallet, active }: { wallet: Wallet; active: boolean }) {
  const theme = themeForColor(wallet.color)
  const leather = LEATHER_SRC[theme]
  const tint = wallet.color ?? '#4ade80'
  return (
    <div
      data-wallet-visual
      className="relative select-none"
      style={{
        width: 260,
        height: 215,
        ['--tint' as string]: tint,
        // La sombra solo en la activa: combinada con el blur+opacity de los
        // slots laterales, el navegador la recorta al bounding box (cuadrada).
        filter: active ? 'drop-shadow(0 20px 26px rgba(0,0,0,0.5))' : 'none',
      }}
    >
      {/* z1 — pared trasera del cuero (detrás de la tarjeta) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={leather}
        alt=""
        aria-hidden
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* z2 — tarjeta metálica teñida al color del wallet, sale de la ranura */}
      <div
        data-wallet-card
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: 190, aspectRatio: '1313 / 1207', top: -66, zIndex: 2 }}
      >
        <div className="absolute inset-0" style={{ filter: active ? 'drop-shadow(0 5px 9px rgba(0,0,0,0.35))' : 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CARD_SRC} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full object-contain" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'var(--tint)',
              mixBlendMode: 'color',
              opacity: 0.55,
              WebkitMaskImage: `url(${CARD_SRC})`,
              maskImage: `url(${CARD_SRC})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />
        </div>
      </div>

      {/* z3 — panel frontal del cuero, recortado por la curva de la boca de la ranura */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={leather}
        alt={wallet.name}
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        style={{
          zIndex: 3,
          clipPath:
            'polygon(0% 14%, 30% 14%, 34% 14.6%, 38% 16.5%, 42% 19.5%, 46% 21.3%, 50% 22%, 54% 21.8%, 58% 20.5%, 62% 18%, 66% 15.5%, 70% 14.4%, 100% 14.4%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  )
}

/** Transform/opacidad/blur por posición coverflow (valores calibrados en la demo). */
const POS_STYLE: Record<Pos, React.CSSProperties> = {
  '0': { transform: 'translateX(0) scale(1) rotateY(0deg)', opacity: 1, filter: 'blur(0px)', zIndex: 10 },
  '-1': { transform: 'translateX(-117px) scale(0.85) rotateY(10deg)', opacity: 0.35, filter: 'blur(3px)', zIndex: 5 },
  '1': { transform: 'translateX(117px) scale(0.85) rotateY(-10deg)', opacity: 0.35, filter: 'blur(3px)', zIndex: 5 },
  'hidden-l': { transform: 'translateX(-200px) scale(0.7)', opacity: 0, zIndex: 1, pointerEvents: 'none' },
  'hidden-r': { transform: 'translateX(200px) scale(0.7)', opacity: 0, zIndex: 1, pointerEvents: 'none' },
}

/** Curva del deslizamiento entre billeteras.
 *  La anterior (0.23, 1, 0.32, 1 — ease-out-quint) gastaba ~80% del recorrido
 *  en el primer tercio del tiempo: en móvil el giro terminaba antes de que el
 *  dedo se levantara y no se percibía. Esta arranca con algo de aceleración y
 *  frena largo, como el paginado de iOS: el mismo recorrido se LEE. */
const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DURATION = 460

/** El indicador de posición sigue al gesto, no al giro: más corto para que el
 *  punto ya esté puesto cuando la billetera todavía está acomodándose. */
const DOT_DURATION = 260

const SWIPE_THRESHOLD = 45

export interface WalletLeatherCarouselProps {
  /** Toque sobre la billetera activa: entrega el wallet y sus capas para el vuelo al detalle. */
  onOpenActive?: (wallet: Wallet, els: { walletEl: HTMLElement; cardEl: HTMLElement }) => void
}

export function WalletLeatherCarousel({ onOpenActive }: WalletLeatherCarouselProps = {}) {
  // Los assets del arte por capas se conocen de antemano: se precargan en paralelo
  // con la query de wallets en vez de esperar a que la data llegue y monte los <img>.
  preload(CARD_SRC, { as: 'image' })
  for (const src of Object.values(LEATHER_SRC)) preload(src, { as: 'image' })

  const { data: wallets = [], isLoading } = useWallets()
  const [rawCurrent, setCurrent] = useState(0)
  const [pressed, setPressed] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const total = wallets.length
  // Índice saneado sin efecto: si la lista encogió, cae dentro de rango.
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

  // Loading: silueta de la billetera en su sitio, no un spinner suelto.
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
          // Feedback de presión: solo en las laterales (la activa no navega a ningún lado).
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
                // reduced-motion: sin desplazamiento ni escala, solo opacidad
                transform: reduce ? 'none' : `${base.transform}${press}`,
                // El hundido de presión responde al dedo (120ms); el giro entre
                // billeteras es el que necesita leerse largo.
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
