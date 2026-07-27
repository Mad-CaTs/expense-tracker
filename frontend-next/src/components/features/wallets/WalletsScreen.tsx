'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync, preload } from 'react-dom'

import { useReducedMotion } from 'framer-motion'

import type { Wallet } from '@/types'

import { cardFaceHTML } from './cardFace'
import { computeAdoptedCard, useWalletFlight } from './useWalletFlight'
import { LEATHER_SRC, themeForColor, WalletLeatherCarousel } from './WalletLeatherCarousel'
import { WalletDetailPanel } from './WalletDetailPanel'

type Stage = 'idle' | 'opening' | 'detail' | 'closing'

const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

/**
 * Pantalla de /wallets: carrusel de billeteras de cuero + detalle con la
 * coreografía aprobada (vuelo con volteo → la billetera aparece → la tarjeta
 * encaja en el bolsillo del marco). El cierre recorre el camino inverso.
 */
export function WalletsScreen() {
  // Assets del detalle precargados desde el primer render: el logo tallado es una
  // MÁSCARA CSS (no se descarga hasta que el detalle monta) y sin esto aparece
  // tarde en la primera apertura, como un paso extra tras el encaje.
  preload('/brand/logo.webp', { as: 'image' })
  preload('/wallets/budget-strip.webp', { as: 'image' })
  preload('/wallets/card-flat.webp', { as: 'image' })

  const [openWallet, setOpenWallet] = useState<Wallet | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [settled, setSettled] = useState(false)
  const [seated, setSeated] = useState(false)
  const [adoptedCard, setAdoptedCard] = useState<{ html: string; clipPath: string } | null>(null)

  const stageRef = useRef<Stage>('idle')
  const screenRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const boundScrollEl = useRef<HTMLElement | null>(null)

  const reduce = useReducedMotion()
  const flight = useWalletFlight(Boolean(reduce))

  // El chrome (top-bar y bottom-nav) se retira DESDE EL TAP: la animación debe
  // correr sobre un escenario limpio. Reaparece cuando el cierre termina (idle).
  useEffect(() => {
    document.body.classList.toggle('wallet-detail-open', stage !== 'idle')
    return () => document.body.classList.remove('wallet-detail-open')
  }, [stage])

  async function openDetail(wallet: Wallet, els: { walletEl: HTMLElement; cardEl: HTMLElement }) {
    if (stageRef.current !== 'idle') return
    stageRef.current = 'opening'
    setOpenWallet(wallet)
    setStage('opening')
    await nextPaint()
    const { current: screen } = screenRef
    const { current: panel } = panelRef
    const { current: strip } = stripRef
    const { current: slot } = slotRef
    if (!screen || !panel || !strip || !slot) return

    const tint = wallet.color ?? '#4ade80'
    const balance = Number(wallet.balance)

    // El panel es fixed a viewport (comparte plano con las capas de cuero fx en body,
    // así el sándwich por z-index es real). Se le fija su caja horizontal = la del
    // screen. Todo ANTES de medir la geometría del vuelo.
    const screenRect = screen.getBoundingClientRect()
    screen.style.setProperty('--wd-left', `${Math.round(screenRect.left)}px`)
    screen.style.setProperty('--wd-width', `${Math.round(screenRect.width)}px`)

    // La adoptada se monta AHORA, oculta (commit síncrono: debe existir en el DOM
    // antes de que el motor la revele); el vuelo corre encima y al terminar el
    // encaje el motor intercambia visibilidades en el mismo tick — sin paso extra.
    const adopted = computeAdoptedCard(panel, strip, slot)
    flushSync(() => {
      setAdoptedCard({
        html: cardFaceHTML(tint, balance, adopted.widthPx),
        clipPath: adopted.clipPath,
      })
    })

    await flight.open(
      {
        screen,
        panel,
        strip,
        slot,
        walletEl: els.walletEl,
        cardEl: els.cardEl,
        leatherSrc: LEATHER_SRC[themeForColor(wallet.color)],
        tint,
        balance,
      },
      () => setSettled(true),
      () => setSeated(true),
    )
    stageRef.current = 'detail'
    setStage('detail')
  }

  async function closeDetail() {
    if (stageRef.current !== 'detail') return
    stageRef.current = 'closing'
    setStage('closing')
    setSeated(false)
    // El motor esconde la adoptada y reaparece la fx en el mismo tick al iniciar.
    await flight.close(() => setSettled(false))
    setAdoptedCard(null)
    boundScrollEl.current = null
    stageRef.current = 'idle'
    setStage('idle')
    setOpenWallet(null)
  }

  const screenClass = ['wd-screen relative mx-auto w-full max-w-[430px]']
  if (stage !== 'idle') screenClass.push('is-detail')
  if (settled) screenClass.push('is-settled')
  if (seated) screenClass.push('is-seated')

  return (
    <div ref={screenRef} className={screenClass.join(' ')}>
      <div className="wd-carousel">
        <WalletLeatherCarousel onOpenActive={openDetail} />
      </div>
      {openWallet && (
        <WalletDetailPanel
          wallet={openWallet}
          adoptedCard={adoptedCard}
          onBack={closeDetail}
          panelRef={panelRef}
          stripRef={stripRef}
          slotRef={slotRef}
          onScrollElReady={(el) => {
            if (boundScrollEl.current === el) return
            boundScrollEl.current = el
            flight.bindScroll(el)
          }}
        />
      )}
    </div>
  )
}
