'use client'

import { useRef } from 'react'
import { preload } from 'react-dom'
import { useRouter } from 'next/navigation'

import { useReducedMotion } from 'framer-motion'

import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'
import type { Wallet } from '@/types'

import { toLeatherId } from './leathers'
import { predictedSlot, useCardTransition } from './useCardTransition'
import { LEATHER_SRC, themeForColor, WalletLeatherCarousel } from './WalletLeatherCarousel'
import { WalletNoticeDialog } from './WalletNoticeDialog'

const leatherOf = (wallet: Wallet) =>
  LEATHER_SRC[wallet.leather ? toLeatherId(wallet.leather) : themeForColor(wallet.color)]

/** Dónde termina el vuelo antes de expandirse: centrada y a casi todo el ancho.
 *  Ya no aterriza en el hueco de la cabecera —desde acá crece hasta cubrir la
 *  pantalla y se desvanece, y la tarjeta de /expenses aparece debajo. */
const SLOT_GUTTER = 26
/** Cuándo se lanza la navegación dentro del vuelo (que dura 1150ms). A media
 *  animación: lo bastante tarde para que el trabajo de React no compita con el
 *  arranque del giro, y lo bastante pronto para que /expenses esté montado
 *  antes de la costura con la expansión. */
const NAV_LEAD_MS = 620
/** Cuándo arranca la expansión, contando desde el clic. Un poco antes de que
 *  termine el vuelo (1150ms) para que no haya un corte entre ambas. */
const EXPAND_LEAD_MS = 1080

/**
 * Portada de la app: se elige billetera y nada más.
 *
 * Al tocar una, su tarjeta despega y vuela hacia /expenses, donde aterriza
 * como cabecera fija. La capa del vuelo cuelga de <body>, así que sobrevive a
 * la navegación: esta pantalla se desmonta con la tarjeta todavía en el aire.
 */
export function WalletsScreen() {
  preload('/brand/logo.webp', { as: 'image' })

  const flying = useRef(false)

  const reduce = useReducedMotion()
  const { launch, expandAndFade } = useCardTransition(Boolean(reduce))
  const router = useRouter()
  const setWalletId = useFilterStore((s) => s.setWalletId)
  useWallets()


  async function openWallet(wallet: Wallet, els: { walletEl: HTMLElement; cardEl: HTMLElement }) {
    if (flying.current) return
    flying.current = true

    // La billetera queda activa ANTES de navegar: /expenses monta ya filtrado
    // por ella y la tarjeta aterriza sobre su propio contenido, no sobre el de
    // la billetera anterior.
    setWalletId(wallet.id)

    // Centrada verticalmente: desde el centro la expansión crece pareja hacia
    // los cuatro bordes, sin tirar de la vista hacia arriba. El alto lo decide
    // `predictedSlot` (proporción de tarjeta), así que se mide primero y se
    // recoloca — no se puede suponer acá sin duplicar esa proporción.
    const flat = predictedSlot(window.innerWidth, 0, SLOT_GUTTER)
    const dest = {
      ...flat,
      top: Math.round((window.innerHeight - flat.height) / 2),
    }

    const flight = launch(
      {
        walletEl: els.walletEl,
        cardEl: els.cardEl,
        leatherSrc: leatherOf(wallet),
        tint: wallet.color ?? '#4ade80',
        balance: Number(wallet.balance),
      },
      dest,
    )

    // La navegación arranca A MITAD del vuelo, no al terminarlo. Montar
    // /expenses cuesta uno o dos frames de trabajo de React, y hacerlo justo en
    // la costura entre el vuelo y la expansión congelaba la tarjeta ahí: era la
    // "pausa" que se notaba. Acá ese coste cae dentro del giro, donde la
    // tarjeta ya está en movimiento y no se percibe.
    window.setTimeout(() => router.push('/expenses'), NAV_LEAD_MS)

    // La expansión se encadena un pelín ANTES de que el vuelo acabe: su último
    // tramo avanza ~0.3px/frame, invisible, y solapar ahí evita que las dos
    // fases tengan una frontera dura.
    window.setTimeout(() => { void expandAndFade() }, EXPAND_LEAD_MS)
    await flight
  }

  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div className="wd-carousel">
        <WalletLeatherCarousel onOpenActive={openWallet} />
      </div>

      <WalletNoticeDialog />
    </div>
  )
}
