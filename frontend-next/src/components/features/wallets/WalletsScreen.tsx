'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync, preload } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'

import { useReducedMotion } from 'framer-motion'

import { useWallets } from '@/lib/hooks/useWallets'
import type { Wallet } from '@/types'

import { cardFaceHTML } from './cardFace'
import { computeAdoptedCard, useWalletFlight } from './useWalletFlight'
import { LEATHER_SRC, themeForColor, WalletLeatherCarousel } from './WalletLeatherCarousel'
import { WalletDetailPanel } from './WalletDetailPanel'

type Stage = 'idle' | 'opening' | 'detail' | 'closing'

const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
const sleep = (ms: number) => new Promise<void>((resolve) => { window.setTimeout(resolve, ms) })

/** Cierre del detalle RESTAURADO (sin vuelo). Espejo de las duraciones que ya
 *  declara globals.css: .wd-reveal (0.3s) para cards y lista, .wd-panel (0.28s)
 *  para el panel. Si cambian allá, cambian aquí. */
const REVEAL_OUT_MS = 300
const PANEL_OUT_MS = 280

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
  // Detalle reconstruido desde ?w=<id> (volviendo de un listado) en vez de abierto
  // con el vuelo: la tarjeta adoptada no pasó por el encaje que la revela.
  const [restored, setRestored] = useState(false)

  const stageRef = useRef<Stage>('idle')
  const screenRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const boundScrollEl = useRef<HTMLElement | null>(null)

  const reduce = useReducedMotion()
  const flight = useWalletFlight(Boolean(reduce))

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: wallets = [] } = useWallets()
  const restoredFor = useRef<string | null>(null)
  // useWalletFlight devuelve un objeto nuevo por render: como dependencia del
  // efecto de restauración lo re-dispararía en cada uno.
  const flightRef = useRef(flight)
  useEffect(() => { flightRef.current = flight }, [flight])

  /**
   * El wallet abierto vive en la URL (?w=<id>). Sin esto el detalle era estado
   * local: al navegar a /categories y volver, la pantalla montaba de cero en
   * el carrusel y perdías la billetera donde estabas.
   *
   * La restauración NO vuela: el vuelo mide una tarjeta de origen que al
   * regresar no existe todavía. Se entra directo al estado final.
   */
  useEffect(() => {
    const raw = searchParams.get('w')
    if (!raw) return
    if (restoredFor.current === raw) return
    if (stageRef.current !== 'idle') return
    const wallet = wallets.find((w) => String(w.id) === raw)
    if (!wallet) return

    restoredFor.current = raw
    stageRef.current = 'detail'

    // Un solo commit: los cuatro estados describen el MISMO instante (detalle ya
    // asentado). Por separado, React los renderiza en cascada y el panel pasa
    // por estados intermedios que no existen al restaurar.
    queueMicrotask(() => {
      setOpenWallet(wallet)
      setStage('detail')
      setSettled(true)
      setRestored(true)
      // seated NO entra aquí: es el gate de .wd-reveal (cards de acceso y lista).
      // En el mismo commit que el montaje, esos elementos nacerían ya en su
      // estado final y no habría transición que ver. Se activa un frame después
      // para que .wd-reveal anime desde opacity:0 / translateY(14px).
    })

    // La tarjeta adoptada es la que se ve DENTRO del bolsillo. En la apertura la
    // genera el vuelo; al restaurar hay que construirla igual, o el marco queda
    // vacío. Se mide después del paint: sus refs no existen hasta que el panel
    // monta, y measureSettled necesita geometría real.
    //
    // Sin cancelación por cleanup a propósito: este efecto vuelve a correr
    // cuando llega la query de wallets, y un `cancelled` abortaría el cálculo
    // mientras los guards de arriba ya impiden que la segunda pasada lo repita
    // — el marco quedaría vacío, que es justo el bug que esto arregla.
    void (async () => {
      await nextPaint()
      const { current: screen } = screenRef
      const { current: panel } = panelRef
      const { current: strip } = stripRef
      const { current: slot } = slotRef
      if (!screen || !panel || !strip || !slot) return

      const screenRect = screen.getBoundingClientRect()
      screen.style.setProperty('--wd-left', `${Math.round(screenRect.left)}px`)
      screen.style.setProperty('--wd-width', `${Math.round(screenRect.width)}px`)

      const adopted = computeAdoptedCard(panel, strip, slot)
      setAdoptedCard({
        html: cardFaceHTML(wallet.color ?? '#4ade80', Number(wallet.balance), adopted.widthPx),
        clipPath: adopted.clipPath,
      })

      // El cuero del dock lo crea el vuelo; sin él la pantalla quedaba flotando
      // sin la billetera inferior. Se monta ya anclado, sin animación.
      flightRef.current.mountSeated({
        screen,
        panel,
        strip,
        slot,
        leatherSrc: LEATHER_SRC[themeForColor(wallet.color)],
      })

      // Recién ahora: el panel ya pintó con las cards en su estado inicial, así
      // que .wd-reveal tiene desde dónde animar y la entrada se ve.
      setSeated(true)
    })()
  }, [searchParams, wallets])

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
    // replace, no push: abrir el detalle no es un paso de historial propio
    // (el ← del panel lo cierra), pero deja la billetera en la URL para que
    // volver desde /categories reabra esta misma.
    restoredFor.current = String(wallet.id)
    router.replace(`/wallets?w=${wallet.id}`, { scroll: false })
  }

  async function closeDetail() {
    if (stageRef.current !== 'detail') return
    stageRef.current = 'closing'
    setStage('closing')
    setSeated(false)
    // is-restored sale YA: su animación de entrada gobierna la opacidad del
    // panel y competiría con la transición de salida.
    setRestored(false)

    if (flight.isActive()) {
      // El motor esconde la adoptada y reaparece la fx en el mismo tick al iniciar.
      await flight.close(() => setSettled(false))
    } else {
      // Detalle restaurado desde ?w=<id>: nunca corrió el vuelo, así que el motor
      // no tiene capas fx que animar y close() retornaría de inmediato — el panel
      // desaparecía de golpe. Se recorre el camino inverso con las mismas clases
      // de estado: primero se retiran las cards y la lista (.wd-reveal, 0.3s),
      // después el panel completo (.wd-panel, 0.28s).
      if (!reduce) await sleep(REVEAL_OUT_MS)
      setSettled(false)
      if (!reduce) await sleep(PANEL_OUT_MS)
    }

    setAdoptedCard(null)
    boundScrollEl.current = null
    stageRef.current = 'idle'
    setStage('idle')
    setOpenWallet(null)
    restoredFor.current = null
    router.replace('/wallets', { scroll: false })
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
          restored={restored}
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
