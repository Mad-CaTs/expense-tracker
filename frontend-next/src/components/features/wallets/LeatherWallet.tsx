'use client'

import { toLeatherId } from '@/components/features/wallets/leathers'
import { LEATHER_SRC, themeForColor } from '@/components/features/wallets/WalletLeatherCarousel'

const CARD_SRC = '/wallets/card.webp'

/**
 * Lo único que el dibujo necesita: el acabado, el tinte de la tarjeta y un
 * nombre para el `alt`. Se pide esto y no un `Wallet` entero porque hay dos
 * sitios (el formulario y el onboarding) que pintan una billetera que TODAVÍA
 * NO EXISTE; con `Wallet` había que inventar `id`, `balance` e
 * `initialBalance` solo para satisfacer al tipo, y esos ceros falsos parecían
 * datos. Un `Wallet` real sigue encajando por estructura.
 */
export interface WalletAppearanceValues {
  name?: string
  color?: string
  leather?: string
}

export interface LeatherWalletProps {
  wallet: WalletAppearanceValues
  active?: boolean
  width?: number
}

export function LeatherWallet({ wallet, active = true, width = 260 }: LeatherWalletProps) {
  const theme = wallet.leather ? toLeatherId(wallet.leather) : themeForColor(wallet.color)
  const leather = LEATHER_SRC[theme]
  const tint = wallet.color ?? '#4ade80'
  const k = width / 260
  return (
    <div
      data-wallet-visual
      className="relative select-none"
      style={{
        width,
        height: 215 * k,
        ['--tint' as string]: tint,
        filter: active ? 'drop-shadow(var(--wallet-drop))' : 'none',
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
        style={{ width: 190 * k, aspectRatio: '1313 / 1207', top: -66 * k, zIndex: 2 }}
      >
        <div className="absolute inset-0" style={{ filter: active ? 'drop-shadow(var(--wallet-card-drop))' : 'none' }}>
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
