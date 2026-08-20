'use client'

import { useCallback, useEffect, useRef } from 'react'

import { cardFaceHTML } from './cardFace'


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

const MOUTH_FRAC = 0.356
const HOVER_INSET_PX = 18

const DOCK_VISIBLE_FRAC = 0.135
const DOCK_MIN = 92
const DOCK_MAX = 128
const dockVisible = (h: number) => Math.max(DOCK_MIN, Math.min(DOCK_MAX, h * DOCK_VISIBLE_FRAC))
const SLOT_FRAC = 0.14
const FLOW_ZONE = 160
const FLOW_P_AT_MOUTH = 0.55

export interface FlightTargets {
  screen: HTMLElement
  panel: HTMLElement
  strip: HTMLElement
  slot: HTMLElement
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
  seatedOnly?: boolean
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
  document.body.append(under, over)

  const dest = measureSettled(t.panel, t.slot)
  const stripR = measureSettled(t.panel, t.strip)

  const stripFront = document.createElement('div')
  stripFront.className = 'wd-fx-strip-front wd-pocket-clip'
  stripFront.style.cssText = `left:${stripR.left}px;top:${stripR.top}px;width:${stripR.width}px;height:${stripR.height}px;`
  stripFront.innerHTML =
    `<img src="${STRIP_SRC}" alt="">` +
    '<span class="wd-logo" aria-hidden="true"><i class="wd-logo-hl"></i><i class="wd-logo-ink"></i><i class="wd-logo-sh"></i></span>'
  over.appendChild(stripFront)

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
    spin.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-540deg)' }], opts(dur, EASE_SPIN)),
  ]
}

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

function anchorH(fx: FxState): number {
  return fx.under.getBoundingClientRect().height || window.innerHeight
}

function dockDy(fx: FxState): number {
  const h = anchorH(fx)
  const scaledH = fx.wRect.height * fx.dockScale
  const bottomY = h + (scaledH - dockVisible(h))
  return bottomY - (fx.wRect.top + fx.wRect.height)
}


function walletAnimations(fx: FxState, dir: 'open' | 'close'): Animation[] {
  const screenR = rectOf(fx.targets.screen)
  fx.dockScale = screenR.width / fx.wRect.width  
  const dy = dockDy(fx)
  fx.dockAnims = fx.leathers.map((el) => {
    el.style.transformOrigin = '50% 100%'
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

export interface SeatedTargets {
  screen: HTMLElement
  panel: HTMLElement
  strip: HTMLElement
  slot: HTMLElement
  leatherSrc: string
}

export interface WalletFlightApi {
  open: (targets: FlightTargets, onSettled: () => void, onSeated: () => void) => Promise<void>
  mountSeated: (targets: SeatedTargets) => void
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

  const mountSeated = useCallback((t: SeatedTargets) => {
    if (fxRef.current) return

    const screenR = rectOf(t.screen)
    const h = window.innerHeight
    const visible = dockVisible(h)
    const natural = { w: 260, h: 215 }
    const width = screenR.width
    const height = (natural.h / natural.w) * width
    const top = h - visible

    const style = `left:${Math.round(screenR.left)}px;top:${Math.round(top)}px;width:${Math.round(width)}px;height:${Math.round(height)}px;`

    const under = document.createElement('div')
    under.className = 'wd-fx wd-fx-under'
    under.innerHTML = `<img class="wd-fx-leather back" src="${t.leatherSrc}" alt="" style="${style}">`

    const over = document.createElement('div')
    over.className = 'wd-fx wd-fx-over'
    over.innerHTML = `<img class="wd-fx-leather front" src="${t.leatherSrc}" alt="" style="${style}">`

    document.body.append(under, over)

    const dest = measureSettled(t.panel, t.slot)
    const destH = dest.width * FLAT_RATIO

    fxRef.current = {
      seatedOnly: true,
      targets: { ...t, walletEl: over, cardEl: over, tint: '', balance: 0 },
      under,
      over,
      fxCard: null as unknown as HTMLDivElement,
      stripFront: null as unknown as HTMLDivElement,
      leathers: [
        under.querySelector('.wd-fx-leather'),
        over.querySelector('.wd-fx-leather.front'),
      ] as HTMLImageElement[],
      wRect: { left: screenR.left, top, width, height },
      card: { left: 0, top: 0, width: dest.width, height: destH },
      dest: { ...dest, height: destH },
      tuck: { drop: 0, clipFrom: 0, clipTo: 0 },
      dockScale: 1,
      tuckAnims: [],
      dockAnims: [],
      docked: true,
      flowOn: false,
      seated: true,
    }
    startFlow(true)
  }, [startFlow])

  const close = useCallback(
    async (onUnsettled: () => void) => {
      const fx = fxRef.current
      if (!fx) return
      stopFlow()
      fx.docked = false
      if (scrollElRef.current) scrollElRef.current.scrollTop = 0

      if (fx.seatedOnly) {
        onUnsettled()
        if (!reduceMotion) {
          await finished(
            fx.leathers.map((el) =>
              el.animate(
                [{ transform: 'translateY(0)' }, { transform: `translateY(${fx.wRect.height}px)` }],
                { duration: WALLET_CLOSE_MS, easing: EASE_FLIGHT, fill: 'forwards' },
              ),
            ),
          )
        }
        fx.under.remove()
        fx.over.remove()
        fxRef.current = null
        return
      }

      fx.fxCard.style.visibility = ''
      fx.stripFront.style.visibility = ''
      fx.targets.panel.querySelector<HTMLElement>('.wd-static-card')?.classList.remove('is-on')
      if (!reduceMotion) await finished(tuckAnimations(fx, 'close'))
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
    mountSeated,
    close,
    bindScroll,
    isActive: () => fxRef.current !== null,
  }
}
