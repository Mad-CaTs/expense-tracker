'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useReducedMotion } from 'framer-motion'
import { Eye, EyeOff, History, TrendingDown, TrendingUp } from 'lucide-react'

import { WalletBalanceAmount } from '@/components/features/wallets/WalletBalanceAmount'
import { CARD_LANDING_KEY, useCardTransition } from '@/components/features/wallets/useCardTransition'
import { useSwipeDownCard } from '@/components/features/wallets/useSwipeDownCard'
import { categoryAura } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'


const LOGO_URL = '/brand/logo.webp'
/** Margen sobre lo que dura la transición antes de barrer una capa huérfana.
 *  Expandir (560) + espera (120) + desvanecer (380) suman ~1060ms desde que
 *  monta esta pantalla: por debajo de eso, el barrido corta la animación. */
const LAYER_SWEEP_MS = 1800
/** Cuándo se navega a /wallets dentro de la vuelta. Pasada la contracción
 *  (620ms), con la tarjeta ya en tamaño de tarjeta y todavía cubriendo: el
 *  montaje de /wallets cae dentro del vuelo de regreso, no en una costura. */
const BACK_NAV_LEAD_MS = 700

interface WalletHeaderCardProps {
  wallet: Wallet
}

/**
 * La tarjeta de la billetera activa, fija en la cabecera de /expenses.
 *
 * Es la MISMA tarjeta de siempre (aurora de color, logo, saldo, Historial), ya
 * no un carrusel: la billetera se eligió en /wallets. La metálica que vuela
 * desde allá no aterriza acá — se desvanece expandida y deja ver esta.
 */
export function WalletHeaderCard({ wallet }: WalletHeaderCardProps) {
  const router = useRouter()
  const reduce = useReducedMotion()

  const slotRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const { land, retreat } = useCardTransition(Boolean(reduce))

  const balance = Number(wallet.balance)
  const initial = Number(wallet.initialBalance)
  const diff = balance - initial
  const pct = initial !== 0 ? ((diff / Math.abs(initial)) * 100).toFixed(1) : null
  const positive = diff >= 0
  const aura = categoryAura(wallet.color ?? '#d4af37')

  /* Sin la inclinación con el puntero que tenía en el carrusel: framer-motion
     reescribía `transform` en cada frame para animar los muelles del giro, y
     eso pisaba el `translateY` del gesto de deslizar — la tarjeta no seguía al
     dedo y nunca llegaba a volver. El gesto es la interacción principal de esta
     tarjeta; la inclinación era un adorno de ratón. */

  // Sin relevo: la tarjeta del vuelo se desvanece expandida y esta aparece
  // debajo. `land` solo barre una capa que hubiera quedado colgando (movimiento
  // reducido, o una navegación que no llegó a expandir).
  useEffect(() => {
    if (!sessionStorage.getItem(CARD_LANDING_KEY)) return
    const t = window.setTimeout(land, LAYER_SWEEP_MS)
    return () => window.clearTimeout(t)
  }, [land])


  const goBackToWallets = useCallback(() => {
    if (leaving) return
    setLeaving(true)

    if (reduce) {
      router.push('/wallets')
      return
    }

    // Espejo de la ida: allí se navegaba a mitad del vuelo para que el coste de
    // React cayera con la tarjeta en movimiento. Acá igual, pero contando desde
    // que arranca la vuelta — /wallets se monta debajo mientras el cuero sube.
    window.setTimeout(() => router.push('/wallets'), BACK_NAV_LEAD_MS)
    void retreat(wallet.color ?? '#4ade80', balance)
  }, [leaving, reduce, retreat, router, wallet.color, balance])

  const swipeRef = useSwipeDownCard({ onCommit: goBackToWallets, disabled: leaving })


  return (
    <div className="px-4 pt-5 pb-1">
      <div className="relative">
        <div
          ref={(el) => {
            slotRef.current = el
            swipeRef.current = el
          }}
          className={`xp-card-slot relative w-full rounded-[22px] text-left${leaving ? ' is-leaving' : ''}`}
        >
          <div className="relative overflow-hidden rounded-[22px]" style={{ background: aura.base }}>
            {/* Aurora animada (blobs difuminados) */}
            <div className="wallet-aura aura-soft" aria-hidden>
              <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
              <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
              <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
              <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
            </div>

            <div className="relative z-[1] flex flex-col p-[22px]" style={{ minHeight: '188px' }}>
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
                      : <TrendingDown size={12} style={{ color: '#fff' }} strokeWidth={2.6} />}
                    <span className="text-[12px] font-bold leading-none tabular-nums" style={{ color: '#fff' }}>
                      {positive ? '+' : ''}{pct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="min-h-[28px] flex-1" />

              <div className="mb-2 flex items-center gap-2">
                <span className="text-[15px] font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {wallet.name}
                </span>
                <button
                  type="button"
                  aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setHidden((v) => !v) }}
                  className="flex h-5 w-5 cursor-pointer items-center justify-center transition-opacity hover:opacity-70 active:scale-90"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {hidden ? <Eye size={17} strokeWidth={2} /> : <EyeOff size={17} strokeWidth={2} />}
                </button>
              </div>

              <div className="flex items-end justify-between gap-3">
                <p
                  className="text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums"
                  style={{ color: '#fff', textShadow: '0 1px 18px rgba(0,0,0,0.25)' }}
                >
                  {hidden ? 'S/ ••••••' : (
                    <>
                      S/{' '}
                      <WalletBalanceAmount walletId={wallet.id} balance={balance} />
                    </>
                  )}
                </p>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); router.push('/reports') }}
                  className="flex h-9 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-[14px] px-3.5 transition-transform active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff' }}
                >
                  <History size={14} strokeWidth={2} />
                  <span className="text-[13px] font-medium">Historial</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Pista del gesto: sin ella, deslizar para volver es invisible. */}
      <div className="flex justify-center pt-2.5">
        <span className="xp-swipe-hint" aria-hidden="true" />
      </div>
      <p className="sr-only">Desliza la tarjeta hacia abajo para cambiar de billetera.</p>
    </div>
  )
}
