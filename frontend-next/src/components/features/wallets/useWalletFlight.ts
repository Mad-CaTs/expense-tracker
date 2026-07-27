'use client'

import { useCallback, useEffect, useRef } from 'react'

import { cardFaceHTML } from './cardFace'

/**
 * Motor del vuelo carrusel → detalle (port del demo aprobado):
 * FASE A — la tarjeta sale de la ranura girando vuelta y media (termina DE FRENTE)
 *          y se detiene en HOVER, asomada en la boca del marco; la billetera baja
 *          al pie de la pantalla ocupándolo de extremo a extremo.
 * FASE B — el panel aparece alrededor de la tarjeta detenida (.is-settled).
 * FASE C — el ENCAJE: la tarjeta se desliza dentro de la ranura con el recorte
 *          inferior animado en sincronía exacta (anclado a la boca del bolsillo).
 * El cierre es el camino inverso completo.
 */

const CARD_FLAT_SRC = '/wallets/card-flat.webp'
const STRIP_SRC = '/wallets/budget-strip.webp'
const FLAT_RATIO = 372 / 570

const FLIGHT_OPEN_MS = 1150
const FLIGHT_CLOSE_MS = 900
const WALLET_OPEN_MS = 1060
const WALLET_CLOSE_MS = 860
const TUCK_OPEN_MS = 420
const TUCK_CLOSE_MS = 300
const SETTLE_LEAD_MS = 140
const SETTLE_PAUSE_MS = 240

const EASE_FLIGHT = 'cubic-bezier(0.55, 0.06, 0.13, 1)'
const EASE_SPIN = 'cubic-bezier(0.6, 0.08, 0.18, 1)'
const EASE_TUCK = 'cubic-bezier(0.23, 1, 0.32, 1)'

/** Boca del bolsillo del marco (fracción del alto, medida sobre el asset). */
const MOUTH_FRAC = 0.356
/** Cuánto queda el borde inferior de la tarjeta DENTRO del marco en el hover. */
const HOVER_INSET_PX = 18

/** Dock: parte visible de la billetera anclada abajo — solo la ranura con su boca.
 *  PROPORCIONAL al alto de pantalla, no fijo: con un valor fijo, en pantallas de
 *  móvil (más altas y con menos área útil que el escritorio) la billetera se comía
 *  la lista y no se veían los movimientos. Se acota entre 92 y 128 px. */
const DOCK_VISIBLE_FRAC = 0.135
const DOCK_MIN = 92
const DOCK_MAX = 128
const dockVisible = (h: number) => Math.max(DOCK_MIN, Math.min(DOCK_MAX, h * DOCK_VISIBLE_FRAC))
const SLOT_FRAC = 0.14
/** Efecto "emerge del bolsillo" al scrollear la lista. */
const FLOW_ZONE = 160
const FLOW_P_AT_MOUTH = 0.55

export interface FlightTargets {
  /** Columna del detalle (coordenadas de viewport: las capas fx son fixed). */
  screen: HTMLElement
  panel: HTMLElement
  strip: HTMLElement
  slot: HTMLElement
  /** Billetera activa del carrusel (cuero y tarjeta de origen). */
  walletEl: HTMLElement
  cardEl: HTMLElement
  leatherSrc: string
  tint: string
  balance: number
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface FxState {
  targets: FlightTargets
  under: HTMLDivElement
  over: HTMLDivElement
  fxCard: HTMLDivElement
  stripFront: HTMLDivElement
  leathers: HTMLImageElement[]
  wRect: Rect
  card: Rect
  dest: Rect
  tuck: { drop: number; clipFrom: number; clipTo: number }
  dockScale: number
  tuckAnims: Animation[]
  dockAnims: Animation[]
  docked: boolean
  flowOn: boolean
  seated: boolean
}

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}
const cx = (r: Rect) => r.left + r.width / 2
const cy = (r: Rect) => r.top + r.height / 2
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}

/**
 * Geometría de la tarjeta ADOPTADA (la que queda montada en el marco): ancho del
 * hueco para su tipografía proporcional y recorte anclado a la boca del bolsillo.
 * Se calcula ANTES del vuelo: la adoptada se monta oculta y el motor la revela
 * en el mismo tick en que termina el encaje (React fuera del instante del relevo).
 */
export function computeAdoptedCard(
  panel: HTMLElement,
  strip: HTMLElement,
  slot: HTMLElement,
): { widthPx: number; clipPath: string } {
  const slotR = measureSettled(panel, slot)
  const stripR = measureSettled(panel, strip)
  const keep = stripR.top + stripR.height * MOUTH_FRAC + 12 - slotR.top
  const slotH = slotR.width * FLAT_RATIO
  return {
    widthPx: slotR.width,
    clipPath: `inset(0 0 ${Math.max(0, Math.round(slotH - keep))}px 0)`,
  }
}

/** Mide el hueco destino con el panel en su posición final (sin transform de entrada). */
function measureSettled(panel: HTMLElement, el: Element): Rect {
  const prevTransition = panel.style.transition
  panel.style.transition = 'none'
  panel.style.transform = 'none'
  const r = rectOf(el)
  panel.style.transform = ''
  void panel.offsetWidth
  panel.style.transition = prevTransition
  return r
}

function buildFx(t: FlightTargets): FxState {
  const wRect = rectOf(t.walletEl)
  const cRect = rectOf(t.cardEl)
  // La tarjeta plana comparte ancho y esquina superior con la alargada del carrusel.
  const card: Rect = { left: cRect.left, top: cRect.top, width: cRect.width, height: cRect.width * FLAT_RATIO }

  const leatherStyle = `left:${wRect.left}px;top:${wRect.top}px;width:${wRect.width}px;height:${wRect.height}px;`
  const under = document.createElement('div')
  under.className = 'wd-fx wd-fx-under'
  under.innerHTML = `<img class="wd-fx-leather back" src="${t.leatherSrc}" alt="" style="${leatherStyle}">`

  const over = document.createElement('div')
  over.className = 'wd-fx wd-fx-over'
  over.innerHTML =
    `<div class="wd-fx-card" style="left:${card.left}px;top:${card.top}px;width:${card.width}px;height:${card.height}px;--tint:${t.tint};">` +
    `<div class="wd-spin">` +
    `<div class="wd-face back"><img src="${CARD_FLAT_SRC}" alt=""><div class="wd-tint"></div></div>` +
    `<div class="wd-face front">${cardFaceHTML(t.tint, t.balance, card.width)}</div>` +
    `</div></div>` +
    `<img class="wd-fx-leather front" src="${t.leatherSrc}" alt="" style="${leatherStyle}">`
  // En body: las capas fx son position:fixed y se anclan al viewport. El sándwich
  // (trasero < panel < frontal) se logra con el PANEL también fixed a pantalla
  // completa durante el detalle (misma capa que las fx), no como hijo del screen.
  document.body.append(under, over)

  const dest = measureSettled(t.panel, t.slot)
  const stripR = measureSettled(t.panel, t.strip)

  // Clon del bolsillo por ENCIMA de la tarjeta fx: la recorta al encajar.
  const stripFront = document.createElement('div')
  stripFront.className = 'wd-fx-strip-front wd-pocket-clip'
  stripFront.style.cssText = `left:${stripR.left}px;top:${stripR.top}px;width:${stripR.width}px;height:${stripR.height}px;`
  // El clon debe ser PIXEL-IDÉNTICO al bolsillo real — incluido el logo tallado.
  // Si no, al ocultarlo el logo "aparece" y el final se lee como un paso extra.
  stripFront.innerHTML =
    `<img src="${STRIP_SRC}" alt="">` +
    '<span class="wd-logo" aria-hidden="true"><i class="wd-logo-hl"></i><i class="wd-logo-ink"></i><i class="wd-logo-sh"></i></span>'
  over.appendChild(stripFront)

  // Geometría del encaje, anclada a la línea de la boca (+12px, siempre tapada).
  const destH = dest.width * FLAT_RATIO
  const below = dest.top - stripR.top + destH - stripR.height
  const drop = Math.ceil(below + HOVER_INSET_PX)
  const scale = dest.width / card.width
  const clipLine = stripR.top + stripR.height * MOUTH_FRAC + 12
  const clipTo = (dest.top + destH - clipLine) / scale

  return {
    targets: t,
    under,
    over,
    fxCard: over.querySelector('.wd-fx-card') as HTMLDivElement,
    stripFront,
    leathers: [under.querySelector('.wd-fx-leather'), over.querySelector('.wd-fx-leather.front')] as HTMLImageElement[],
    wRect,
    card,
    dest: { ...dest, height: destH },
    tuck: { drop, clipFrom: clipTo - drop / scale, clipTo },
    dockScale: 1,
    tuckAnims: [],
    dockAnims: [],
    docked: false,
    flowOn: false,
    seated: false,
  }
}

function cardAnimations(fx: FxState, dir: 'open' | 'close'): Animation[] {
  const { card, dest, tuck, fxCard } = fx
  const dx = cx(dest) - cx(card)
  const dy = cy(dest) - cy(card) - tuck.drop
  const scale = dest.width / card.width
  const opts = (dur: number, easing: string): KeyframeAnimationOptions => ({
    duration: dur,
    easing,
    fill: 'forwards',
    direction: dir === 'open' ? 'normal' : 'reverse',
  })
  const dur = dir === 'open' ? FLIGHT_OPEN_MS : FLIGHT_CLOSE_MS
  const spin = fxCard.querySelector('.wd-spin') as HTMLElement
  return [
    fxCard.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }],
      opts(dur, EASE_FLIGHT),
    ),
    // Vuelta y media: sale de espaldas (logo) y termina DE FRENTE (saldo).
    spin.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-540deg)' }], opts(dur, EASE_SPIN)),
  ]
}

/**
 * Re-ancla el encaje al hueco REAL en este instante (el panel ya está asentado):
 * cualquier deriva de layout ocurrida durante el vuelo (scrollbar del sistema,
 * swap de fuentes, datos que llegan) queda anulada — la tarjeta fx termina
 * EXACTAMENTE donde vive la adoptada y el relevo no puede verse como un salto.
 */
function retargetToLiveSlot(fx: FxState): void {
  const dest = rectOf(fx.targets.slot)
  const stripR = rectOf(fx.targets.strip)
  const destH = dest.width * FLAT_RATIO
  const below = dest.top - stripR.top + destH - stripR.height
  const drop = Math.ceil(below + HOVER_INSET_PX)
  const scale = dest.width / fx.card.width
  const clipLine = stripR.top + stripR.height * MOUTH_FRAC + 12
  const clipTo = (dest.top + destH - clipLine) / scale
  fx.dest = { ...dest, height: destH }
  fx.tuck = { drop, clipFrom: clipTo - drop / scale, clipTo }
}

/**
 * FASE C: keyframes explícitos por dirección (reverse invertiría el easing).
 * El transform usa keyframe único con ARRANQUE IMPLÍCITO (desde donde esté la
 * tarjeta ahora mismo): el deslizamiento nace sin costura desde el hover real.
 */
function tuckAnimations(fx: FxState, dir: 'open' | 'close'): Animation[] {
  if (dir === 'open') retargetToLiveSlot(fx)
  const { card, dest, tuck, fxCard } = fx
  const dx = cx(dest) - cx(card)
  const dy = cy(dest) - cy(card)
  const scale = dest.width / card.width
  const hover = { transform: `translate(${dx}px, ${dy - tuck.drop}px) scale(${scale})` }
  const seated = { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }
  const clipHover = { clipPath: `inset(-28px -28px ${tuck.clipFrom}px -28px)` }
  const clipSeated = { clipPath: `inset(-28px -28px ${tuck.clipTo}px -28px)` }
  const opts: KeyframeAnimationOptions = {
    duration: dir === 'open' ? TUCK_OPEN_MS : TUCK_CLOSE_MS,
    easing: EASE_TUCK,
    fill: 'forwards',
  }
  // La sombra ambiental muere al entrar al bolsillo (y renace al salir): al asentarse
  // la fx queda SIN sombra, idéntica a la adoptada — el relevo no cambia ni un píxel.
  const face = fxCard.querySelector('.wd-face.front') as HTMLElement
  const shadowOn = { filter: 'drop-shadow(0 5px 9px rgba(0, 0, 0, 0.3))' }
  const shadowOff = { filter: 'drop-shadow(0 1px 0px rgba(0, 0, 0, 0))' }
  const anims =
    dir === 'open'
      ? [
          fxCard.animate([seated], opts),
          fxCard.animate([clipHover, clipSeated], opts),
          face.animate([shadowOn, shadowOff], opts),
        ]
      : [
          fxCard.animate([hover], opts),
          fxCard.animate([clipSeated, clipHover], opts),
          face.animate([shadowOff, shadowOn], opts),
        ]
  fx.tuckAnims.push(...anims)
  return anims
}

/** Fondo ESTABLE de anclaje = alto del contenedor fx (`position:fixed; inset:0`),
 *  el mismo fondo al que se ancla el `.wd-panel`. NO usar `visualViewport.height`
 *  ni `innerHeight`: en iOS Safari cambian cuando la barra inferior aparece/oculta
 *  al scrollear, y hacían que la billetera del dock subiera y bajara. El contenedor
 *  fixed no se mueve con la barra → la billetera queda estática abajo del todo. */
function anchorH(fx: FxState): number {
  return fx.under.getBoundingClientRect().height || window.innerHeight
}

/** Desplazamiento vertical del dock.
 *  La billetera se escala desde su borde INFERIOR (transformOrigin 50% 100%), así el
 *  crecimiento por la escala va hacia ARRIBA y el borde inferior queda donde lo
 *  posicionamos. Antes se escalaba desde arriba (50% 0%): el excedente de alto
 *  (215px → ~342px al escalar x1.6) se derramaba hacia abajo y empujaba la boca de
 *  la ranura fuera de la pantalla, mostrando el cuerpo entero en vez de la abertura.
 *  Colocamos el borde inferior de la billetera ESCALADA a (altoBilleteraEscalada −
 *  dockVisible) por debajo del fondo, de modo que solo asome `dockVisible`. */
function dockDy(fx: FxState): number {
  const h = anchorH(fx)
  const scaledH = fx.wRect.height * fx.dockScale
  const bottomY = h + (scaledH - dockVisible(h)) // dónde debe quedar el borde inferior
  return bottomY - (fx.wRect.top + fx.wRect.height)
}


function walletAnimations(fx: FxState, dir: 'open' | 'close'): Animation[] {
  const screenR = rectOf(fx.targets.screen)
  fx.dockScale = screenR.width / fx.wRect.width   // antes de dockDy: lo necesita
  const dy = dockDy(fx)
  fx.dockAnims = fx.leathers.map((el) => {
    el.style.transformOrigin = '50% 100%'          // escala desde el borde inferior
    return el.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(0, ${dy}px) scale(${fx.dockScale})` }],
      {
        duration: dir === 'open' ? WALLET_OPEN_MS : WALLET_CLOSE_MS,
        easing: EASE_FLIGHT,
        fill: 'forwards',
        direction: dir === 'open' ? 'normal' : 'reverse',
      },
    )
  })
  return fx.dockAnims
}

const finished = (anims: Animation[]) => Promise.allSettled(anims.map((a) => a.finished))

export interface WalletFlightApi {
  /** `onSettled`: el marco aparece (la tarjeta se detiene). `onSeated`: la tarjeta
   *  ENCAJÓ — es el momento en que el resto del contenido debe entrar. */
  open: (targets: FlightTargets, onSettled: () => void, onSeated: () => void) => Promise<void>
  close: (onUnsettled: () => void) => Promise<void>
  bindScroll: (el: HTMLElement) => void
  isActive: () => boolean
}

export function useWalletFlight(reduceMotion: boolean): WalletFlightApi {
  const fxRef = useRef<FxState | null>(null)
  const rafPending = useRef(false)
  const scrollElRef = useRef<HTMLElement | null>(null)


  useEffect(
    () => () => {
      fxRef.current?.under.remove()
      fxRef.current?.over.remove()
      fxRef.current = null
    },
    [],
  )

  const applyFlow = useCallback(() => {
    const fx = fxRef.current
    if (!fx || !fx.flowOn) return
    // Línea de emergencia = boca de la ranura del dock (anclado al borde inferior).
    const anchor = anchorH(fx)
    const slotY = anchor - dockVisible(anchor) + SLOT_FRAC * fx.wRect.height * fx.dockScale
    fx.targets.panel.querySelectorAll<HTMLElement>('.wd-flow-el').forEach((el) => {
      const r = el.getBoundingClientRect()
      const q = (slotY - r.bottom) / FLOW_ZONE
      const p = smooth(FLOW_P_AT_MOUTH + (1 - FLOW_P_AT_MOUTH) * q)
      el.style.opacity = String(p)
      el.style.transform = `translateY(${(1 - p) * 18}px) scale(${0.95 + 0.05 * p})`
    })
  }, [])

  const startFlow = useCallback(
    (instant: boolean) => {
      const fx = fxRef.current
      if (!fx) return
      fx.flowOn = true
      const panel = fx.targets.panel
      panel.classList.add('wd-flow')
      if (instant) panel.classList.add('wd-flow-live')
      applyFlow()
      if (!instant) setTimeout(() => panel.classList.add('wd-flow-live'), 340)
    },
    [applyFlow],
  )

  const stopFlow = useCallback(() => {
    const fx = fxRef.current
    if (!fx) return
    fx.flowOn = false
    fx.targets.panel.classList.remove('wd-flow', 'wd-flow-live')
    fx.targets.panel.querySelectorAll<HTMLElement>('.wd-flow-el').forEach((el) => {
      el.style.opacity = ''
      el.style.transform = ''
    })
  }, [])

  const bindScroll = useCallback(
    (el: HTMLElement) => {
      scrollElRef.current = el
      el.addEventListener(
        'scroll',
        () => {
          const fx = fxRef.current
          if (!fx || !fx.seated) return
          // El "emerge del bolsillo" se enciende con el PRIMER gesto de scroll (sin
          // transición: el propio movimiento lo enmascara) — nunca de forma autónoma.
          if (!fx.flowOn) startFlow(true)
          if (rafPending.current) return
          rafPending.current = true
          requestAnimationFrame(() => {
            rafPending.current = false
            applyFlow()
          })
        },
        { passive: true },
      )
    },
    [applyFlow, startFlow],
  )

  const open = useCallback(
    async (targets: FlightTargets, onSettled: () => void, onSeated: () => void) => {
      const fx = buildFx(targets)
      fxRef.current = fx
      targets.walletEl.style.visibility = 'hidden'

      // FINAL EN UN SOLO TICK: al terminar el encaje se revela la adoptada (reajustada
      // al hueco real), se oculta la fx y se avisa a la pantalla (onSeated) para que
      // entre el resto del contenido.
      const finishSeated = () => {
        const staticCard = fx.targets.panel.querySelector<HTMLElement>('.wd-static-card')
        if (staticCard) {
          const slotR = rectOf(fx.targets.slot)
          const stripR = rectOf(fx.targets.strip)
          const keep = stripR.top + stripR.height * MOUTH_FRAC + 12 - slotR.top
          staticCard.style.clipPath = `inset(0 0 ${Math.max(0, Math.round(slotR.height - keep))}px 0)`
          const face = staticCard.querySelector<HTMLElement>('.wd-card-front')
          if (face) face.style.fontSize = `${(slotR.width * 0.062).toFixed(2)}px`
          staticCard.classList.add('is-on')
        }
        fx.fxCard.style.visibility = 'hidden'
        fx.stripFront.style.visibility = 'hidden'
        fx.docked = true
        fx.seated = true
        onSeated()
      }

      const anims = [...walletAnimations(fx, 'open'), ...cardAnimations(fx, 'open')]
      if (reduceMotion) {
        anims.forEach((a) => a.finish())
        onSettled()
        fx.stripFront.classList.add('is-settled')
        tuckAnimations(fx, 'open').forEach((a) => a.finish())
        finishSeated()
        startFlow(true)
        return
      }
      // FASE B se solapa: el panel empieza a aparecer antes de que la tarjeta se detenga.
      setTimeout(() => {
        onSettled()
        fx.stripFront.classList.add('is-settled')
      }, FLIGHT_OPEN_MS - SETTLE_LEAD_MS)
      await finished(anims)
      await sleep(SETTLE_PAUSE_MS)
      await finished(tuckAnimations(fx, 'open'))
      finishSeated()
    },
    [reduceMotion, startFlow],
  )

  const close = useCallback(
    async (onUnsettled: () => void) => {
      const fx = fxRef.current
      if (!fx) return
      stopFlow()
      fx.docked = false
      if (scrollElRef.current) scrollElRef.current.scrollTop = 0
      // Relevo inverso en el mismo tick: la fx (idéntica, sentada) reaparece y la
      // adoptada se esconde; después la fx sale de la ranura.
      fx.fxCard.style.visibility = ''
      fx.stripFront.style.visibility = ''
      fx.targets.panel.querySelector<HTMLElement>('.wd-static-card')?.classList.remove('is-on')
      if (!reduceMotion) await finished(tuckAnimations(fx, 'close'))
      // El clip debe irse ANTES del vuelo de regreso (el pop lo tapa el clon del bolsillo).
      fx.tuckAnims.forEach((a) => a.cancel())
      fx.tuckAnims = []
      onUnsettled()
      fx.stripFront.classList.remove('is-settled')
      const anims = [...walletAnimations(fx, 'close'), ...cardAnimations(fx, 'close')]
      if (reduceMotion) anims.forEach((a) => a.finish())
      await finished(anims)
      fx.targets.walletEl.style.visibility = ''
      fx.under.remove()
      fx.over.remove()
      fxRef.current = null
    },
    [reduceMotion, stopFlow],
  )

  return {
    open,
    close,
    bindScroll,
    isActive: () => fxRef.current !== null,
  }
}
