'use client'

import { useCallback } from 'react'

import { metallicTintColor } from './cardFace'
import { DEFAULT_LEATHER, leatherSrc } from './leathers'

/** Tarjeta con el logo de la app: la cara principal del vuelo. */
const CARD_FLAT_SRC = '/wallets/card-flat.webp'
/** Proporción de la tarjeta en el carrusel: la del asset (tarjeta física). */
const FLAT_RATIO = 372 / 570
/** Proporción al final del vuelo, antes de expandirse. Cerca de la de una
 *  tarjeta real (1.586:1): el 2:1 de antes venía del hueco de la cabecera, que
 *  ya no existe —la tarjeta se expande y se desvanece—, y a ancho completo se
 *  veía achatada. */
const DEST_RATIO = 1 / 1.62

const FLIGHT_MS = 1150
const WALLET_MS = 1060
/** Expansión final hasta cubrir la pantalla, y desvanecido DESPUÉS de ella.
 *  Las dos fases son consecutivas, no solapadas: la tarjeta llega a llenar la
 *  pantalla del todo antes de empezar a irse. */
const EXPAND_MS = 620
/** Solapamiento del desvanecido con el final de la expansión. La tarjeta ya
 *  cubre la pantalla mucho antes de terminar de crecer (llega al borde a media
 *  animación y el resto es el sangrado), así que empezar a irse un poco antes
 *  no descubre nada y quita el frenazo entre las dos fases. */
const FADE_OVERLAP_MS = 170
const FADE_MS = 420
/** Salida del contenido de la cara, antes de que la tarjeta crezca. */
const CONTENT_OUT_MS = 200
/** La tarjeta se pasa unos píxeles de los bordes: creciendo justo hasta el
 *  borde, el antialias deja una línea del fondo alrededor. */
const EXPAND_BLEED = 24
/** Vuelo: acelera y frena, pero NO hasta cero (el punto de control final es
 *  0.86, no 1). Llegando con algo de velocidad, la expansión que viene detrás
 *  la recoge en vez de arrancar desde parado. */
const EASE_FLIGHT = 'cubic-bezier(0.55, 0.06, 0.2, 0.86)'
const EASE_SPIN = 'cubic-bezier(0.6, 0.08, 0.18, 1)'
/** Expansión: acelera SUAVE desde casi parado y frena largo. El vuelo llega a
 *  ~0.3px/frame y una curva de salida brusca saltaba a 9px/frame — un tirón de
 *  30× en la costura, que es lo que se leía como "no smooth". Con una entrada
 *  gradual la velocidad crece de forma continua. */
const EASE_EXPAND = 'cubic-bezier(0.5, 0, 0.2, 1)'
/** Salida del carrusel: la billetera de cuero se hunde fuera de pantalla. */
const DOCK_VISIBLE_FRAC = 0.135
const DOCK_MIN = 92
const DOCK_MAX = 128
const dockVisible = (h: number) => Math.max(DOCK_MIN, Math.min(DOCK_MAX, h * DOCK_VISIBLE_FRAC))

/** Clave de sessionStorage: el vuelo cruza una navegación de Next, así que el
 *  estado no puede vivir en un ref — la pantalla de origen se desmonta. */
const PENDING = 'pockr-card-landing'
/** Geometría del origen (billetera y tarjeta en /wallets), para poder DESHACER
 *  el vuelo con el gesto. Sobrevive a `land`, que sí limpia PENDING: la vuelta
 *  puede pedirse mucho después de haber aterrizado. */
const ORIGIN_KEY = 'pockr-card-origin'
/** Margen lateral del tamaño intermedio en la vuelta. Igual que `SLOT_GUTTER`
 *  en WalletsScreen: la ida y la vuelta pasan por el mismo tamaño. */
const RETREAT_GUTTER = 26
/** Mientras la tarjeta cubre la pantalla, la página de debajo congela sus
 *  animaciones de entrada (regla en globals.css). */
const COVERING_CLASS = 'card-covering'
/** Solo en la VUELTA: además de pausar, oculta el contenido de la página. La
 *  tarjeta se encoge en vez de crecer, así que no la tapa por sí sola. */
const SHRINKING_CLASS = 'card-shrinking'
/** Solo en la IDA: atenúa el carrusel y el saldo de /wallets en cuanto la
 *  tarjeta despega — se quedaban visibles sobre la animación. */
const LAUNCHING_CLASS = 'card-launching'

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface FlightOrigin {
  walletEl: HTMLElement
  cardEl: HTMLElement
  leatherSrc: string
  tint: string
  balance: number
}

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

const opts = (duration: number, easing: string): KeyframeAnimationOptions => ({
  duration,
  easing,
  fill: 'forwards',
})

const geom = (r: Rect) => ({
  left: `${r.left}px`,
  top: `${r.top}px`,
  width: `${r.width}px`,
  height: `${r.height}px`,
})

const finished = (anims: Animation[]) => Promise.allSettled(anims.map((a) => a.finished))

/** Dónde caerá la tarjeta en /expenses, medido ANTES de navegar. El slot aún no
 *  existe, así que se deduce de la geometría de la pantalla: mismo cálculo que
 *  aplica `.xp-card-slot` (ancho completo menos los márgenes laterales). */
export function predictedSlot(screenW: number, topOffset: number, sideGutter: number): Rect {
  const width = screenW - sideGutter * 2
  return { left: sideGutter, top: topOffset, width, height: width * DEST_RATIO }
}


function fallbackOrigin(tint: string) {
  const slot = predictedSlot(window.innerWidth, 0, RETREAT_GUTTER)
  slot.top = Math.round((window.innerHeight - slot.height) / 2)
  return { card: slot, wallet: slot, leatherSrc: leatherSrc(DEFAULT_LEATHER), tint }
}

interface Layer {
  under: HTMLDivElement
  over: HTMLDivElement
  fxCard: HTMLDivElement
  leathers: HTMLImageElement[]
  /** Panel opaco que crece en la fase final; ver `expandAndFade`. */
  solidPanel?: HTMLDivElement
}

/** La capa en vuelo, a nivel de módulo: sobrevive al desmontaje de la pantalla
 *  que la lanzó, que ocurre a mitad de la transición. */
const liveLayer: { current: Layer | null } = { current: null }

function buildLayer(origin: FlightOrigin, card: Rect, wRect: Rect): Layer {
  const leatherStyle = `left:${wRect.left}px;top:${wRect.top}px;width:${wRect.width}px;height:${wRect.height}px;`

  const under = document.createElement('div')
  under.className = 'wd-fx wd-fx-under'
  under.innerHTML = `<img class="wd-fx-leather back" src="${origin.leatherSrc}" alt="" style="${leatherStyle}">`

  const over = document.createElement('div')
  over.className = 'wd-fx wd-fx-over'
  over.innerHTML =
    `<div class="wd-fx-card" style="left:${card.left}px;top:${card.top}px;width:${card.width}px;height:${card.height}px;--tint:${origin.tint};">` +
    '<div class="wd-spin">' +
    // Cara PRINCIPAL: la tarjeta con el logo grabado, teñida del color de la
    // billetera (la imagen es plateada; `.wd-tint` la colorea por blend).
    '<div class="wd-face back">' +
    `<img class="wd-fx-logo" src="${CARD_FLAT_SRC}" alt="">` +
    '<div class="wd-tint"></div>' +
    '</div>' +
    // Cara TRASERA en blanco: solo el color. Acá vivía el diseño viejo
    // (saldo, chip, VISA), que se veía a media vuelta.
    `<div class="wd-face front" style="background:${metallicTintColor(origin.tint)}"></div>` +
    '</div></div>' +
    `<img class="wd-fx-leather front" src="${origin.leatherSrc}" alt="" style="${leatherStyle}">`

  document.body.append(under, over)

  return {
    under,
    over,
    fxCard: over.querySelector('.wd-fx-card') as HTMLDivElement,
    leathers: [
      under.querySelector('.wd-fx-leather'),
      over.querySelector('.wd-fx-leather.front'),
    ] as HTMLImageElement[],
  }
}

/**
 * La tarjeta viaja del carrusel de /wallets a su sitio en /expenses, cruzando la
 * navegación. Las capas cuelgan de `document.body`, no del árbol de React, así
 * que sobreviven al cambio de ruta: la pantalla de origen se desmonta mientras
 * la tarjeta sigue en vuelo, y /expenses la recoge al montar.
 *
 * Se anima la GEOMETRÍA (left/top/width/height) y no un `scale`: origen y
 * destino tienen proporciones distintas (1.53:1 contra 2:1) y un factor único
 * multiplicaría ancho y alto por igual, dejando la altura pasada al aterrizar.
 */
export function useCardTransition(reduceMotion: boolean) {

  /** Expansión final: la tarjeta crece hasta cubrir la pantalla y se desvanece,
   *  dejando ver /expenses debajo (propuesta B). No aterriza en ningún hueco —
   *  la tarjeta de esa página ya está puesta cuando el velo termina de irse. */
  const expandAndFade = useCallback(async () => {
    const layer = liveLayer.current
    if (!layer) return

    const from = layer.fxCard.getBoundingClientRect()
    const full: Rect = {
      left: -EXPAND_BLEED,
      top: -EXPAND_BLEED,
      width: window.innerWidth + EXPAND_BLEED * 2,
      height: window.innerHeight + EXPAND_BLEED * 2,
    }

    // Todo el dibujo de la tarjeta se retira antes de crecer: la cara mide en
    // `em`, así que al expandirse se convertía en un grafismo gigante (el logo
    // de Pockr ocupando la pantalla). Lo que crece es solo el color.
    const spin = layer.fxCard.querySelector('.wd-spin') as HTMLElement | null
    // El color sale de la cara lisa, que ya lleva el tono teñido del metal: el
    // relevo entre el dibujo de la tarjeta y el panel de color no se ve.
    const flat = layer.fxCard.querySelector('.wd-face.front') as HTMLElement | null
    const solid = flat ? getComputedStyle(flat).backgroundColor : 'transparent'

    /* El color va en un nodo APARTE, no en `.wd-fx-card`. Esa tarjeta lleva
       `transform-style: preserve-3d` para el giro, y dentro de un contexto 3D
       el navegador compone la capa en vez de pintarla plana: el fondo salía
       translúcido y /expenses se transparentaba detrás. Este panel es un
       hermano sin 3D, así que tapa de verdad. */
    const solidPanel = document.createElement('div')
    solidPanel.className = 'wd-fx-solid'
    solidPanel.style.cssText =
      `position:fixed;left:${from.left}px;top:${from.top}px;` +
      `width:${from.width}px;height:${from.height}px;` +
      `background:${solid};border-radius:22px;z-index:41;pointer-events:none;`
    document.body.append(solidPanel)
    layer.solidPanel = solidPanel

    // La tarjeta con su dibujo queda por encima mientras se desvanece.
    layer.fxCard.style.zIndex = '42'
    if (spin) {
      spin.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: CONTENT_OUT_MS,
        easing: 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'forwards',
      })
    }

    const fromRect: Rect = { left: from.left, top: from.top, width: from.width, height: from.height }
    // El desvanecido se solapa con el tramo final de la expansión: para
    // entonces la tarjeta ya cubre la pantalla y solo le queda el sangrado.
    const fadeOpts: KeyframeAnimationOptions = {
      duration: FADE_MS,
      delay: EXPAND_MS - FADE_OVERLAP_MS,
      easing: 'cubic-bezier(0.33, 0, 0.67, 1)',
      fill: 'forwards',
    }

    await finished([
      layer.fxCard.animate([geom(fromRect), geom(full)], opts(EXPAND_MS, EASE_EXPAND)),
      // El radio se abre a la vez que crece: una tarjeta con esquinas
      // redondeadas a pantalla completa se lee como una tarjeta gigante, no
      // como la página que hay debajo.
      layer.fxCard.animate([{ borderRadius: '22px' }, { borderRadius: '0px' }], opts(EXPAND_MS, EASE_EXPAND)),
      layer.fxCard.animate([{ opacity: 1 }, { opacity: 0 }], fadeOpts),
      // El panel opaco crece y se va con la tarjeta, en el mismo compás.
      solidPanel.animate([geom(fromRect), geom(full)], opts(EXPAND_MS, EASE_EXPAND)),
      solidPanel.animate([{ borderRadius: '22px' }, { borderRadius: '0px' }], opts(EXPAND_MS, EASE_EXPAND)),
      solidPanel.animate([{ opacity: 1 }, { opacity: 0 }], fadeOpts),
    ])

    layer.under.remove()
    layer.over.remove()
    solidPanel.remove()
    // Suelta las animaciones de entrada de /expenses: ahora sí se ven.
    document.body.classList.remove(COVERING_CLASS, LAUNCHING_CLASS)
    liveLayer.current = null
    sessionStorage.removeItem(PENDING)
  }, [])

  /** Despegue desde /wallets. Resuelve cuando toca navegar, con la tarjeta ya
   *  volando: /expenses se monta debajo mientras ella termina el giro. */
  const launch = useCallback(
    async (origin: FlightOrigin, dest: Rect) => {
      const wRect = rectOf(origin.walletEl)
      const cRect = rectOf(origin.cardEl)
      const card: Rect = {
        left: cRect.left,
        top: cRect.top,
        width: cRect.width,
        height: cRect.width * FLAT_RATIO,
      }

      const layer = buildLayer(origin, card, wRect)
      liveLayer.current = layer
      origin.walletEl.style.visibility = 'hidden'
      // /expenses se monta debajo de la tarjeta: sus animaciones de entrada
      // quedan en pausa hasta que ella se retire (ver `expandAndFade`).
      // `LAUNCHING` atenúa a la vez el carrusel y el saldo de /wallets, que si
      // no se quedaban visibles sobre la tarjeta en vuelo.
      document.body.classList.add(COVERING_CLASS, LAUNCHING_CLASS)

      // Se guarda el ORIGEN además del destino: al volver con el gesto, la
      // tarjeta tiene que regresar exactamente al hueco del que salió, y para
      // entonces /wallets aún no está montado — no hay nada que medir.
      sessionStorage.setItem(PENDING, JSON.stringify({ tint: origin.tint, balance: origin.balance, dest }))
      sessionStorage.setItem(
        ORIGIN_KEY,
        JSON.stringify({ card, wallet: wRect, leatherSrc: origin.leatherSrc, tint: origin.tint }),
      )

      if (reduceMotion) {
        Object.assign(layer.fxCard.style, geom(dest))
        document.body.classList.remove(COVERING_CLASS, LAUNCHING_CLASS)
        return
      }

      const spin = layer.fxCard.querySelector('.wd-spin') as HTMLElement

      // El cuero se hunde: la tarjeta lo abandona y la pantalla queda libre.
      const anchor = window.innerHeight
      const dy = anchor + wRect.height - wRect.top
      const anims: Animation[] = layer.leathers.map((el) => {
        el.style.transformOrigin = '50% 100%'
        return el.animate(
          [{ transform: 'translate(0,0)' }, { transform: `translate(0, ${dy}px)` }],
          opts(WALLET_MS, EASE_FLIGHT),
        )
      })

      anims.push(
        layer.fxCard.animate([geom(card), geom(dest)], opts(FLIGHT_MS, EASE_FLIGHT)),
        // Vuelta ENTERA (-720°): la cara del logo es `.wd-face.back`, que NO
        // está pre-rotada, así que mira al frente en las vueltas pares. Con
        // -540° el vuelo terminaba en la cara lisa.
        spin.animate(
          [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-720deg)' }],
          opts(FLIGHT_MS, EASE_SPIN),
        ),
      )
      await finished(anims)
    },
    [reduceMotion],
  )

  /** Red de seguridad al montar /expenses: ya no hay traspaso —la tarjeta se
   *  desvanece expandida y la de esta página aparece debajo, sin relevo—, pero
   *  si algo dejó una capa colgando (movimiento reducido, una navegación que se
   *  quedó a medias) se retira acá para que no tape la pantalla. */
  const land = useCallback(() => {
    const layer = liveLayer.current
    sessionStorage.removeItem(PENDING)
    // Pase lo que pase, la página no puede quedarse con la entrada congelada.
    document.body.classList.remove(COVERING_CLASS, SHRINKING_CLASS, LAUNCHING_CLASS)
    if (!layer) return
    layer.under.remove()
    layer.over.remove()
    liveLayer.current = null
  }, [])

  /**
   * Vuelta a /wallets: la MISMA transición al revés.
   *
   * Tres fases espejo de la ida — el color llena la pantalla y se contrae hasta
   * tamaño de tarjeta, la tarjeta vuela de vuelta girando en sentido contrario,
   * y el cuero sube desde abajo para recogerla. Necesita la geometría del
   * origen, que guardó `launch` en sessionStorage: al iniciar el gesto,
   * /wallets todavía no existe y no hay nada que medir.
   */
  const retreat = useCallback(
    async (tint: string, balance: number) => {
      if (reduceMotion) return

      /* `launch` guarda la geometría del origen, pero puede no estar: se entró
         a /expenses sin volar (recarga, enlace directo, o la pestaña se
         restauró tras un rato y sessionStorage ya no la tenía). Antes se
         retornaba en seco y quedaba lo peor de los dos mundos — la pantalla ya
         había decidido irse, así que navegaba sin animación y con la tarjeta
         congelada. Se deduce un origen plausible y la vuelta se anima igual. */
      const raw = sessionStorage.getItem(ORIGIN_KEY)
      const origin = raw
        ? (JSON.parse(raw) as { card: Rect; wallet: Rect; leatherSrc: string; tint: string })
        : fallbackOrigin(tint)

      const full: Rect = {
        left: -EXPAND_BLEED,
        top: -EXPAND_BLEED,
        width: window.innerWidth + EXPAND_BLEED * 2,
        height: window.innerHeight + EXPAND_BLEED * 2,
      }
      // Tamaño intermedio: el mismo en el que la ida terminaba el vuelo y
      // empezaba a expandirse, así el camino de vuelta lo recorre igual.
      const mid = predictedSlot(window.innerWidth, 0, RETREAT_GUTTER)
      mid.top = Math.round((window.innerHeight - mid.height) / 2)

      // La pantalla queda cubierta desde el primer frame: sin esto se veía
      // /expenses alrededor del panel mientras se contraía, y su chrome
      // (top-bar y navbar) asomaba por encima. `SHRINKING` además oculta el
      // contenido: acá la tarjeta MENGUA y no tapa la página por sí sola.
      document.body.classList.add(COVERING_CLASS, SHRINKING_CLASS)

      /* Desde acá todo va en try/finally: si algo revienta a mitad del vuelo
         —un asset que no carga, la pestaña que se va al fondo— estas clases
         ocultan el contenido, la top-bar y la navbar. Sin el finally la app
         quedaba en blanco y solo se recuperaba recargando. */
      try {
      const layer = buildLayer(
        {
          walletEl: document.body,
          cardEl: document.body,
          leatherSrc: origin.leatherSrc,
          tint: tint || origin.tint,
          balance,
        },
        full,
        origin.wallet,
      )
      liveLayer.current = layer

      const spin = layer.fxCard.querySelector('.wd-spin') as HTMLElement
      const solid = metallicTintColor(tint || origin.tint)

      // FASE 1 — el color cubre la pantalla y se contrae a tamaño de tarjeta.
      // Espejo de la expansión: mismo panel opaco sin 3D, misma curva invertida.
      const solidPanel = document.createElement('div')
      solidPanel.className = 'wd-fx-solid'
      solidPanel.style.cssText =
        `position:fixed;left:${full.left}px;top:${full.top}px;` +
        `width:${full.width}px;height:${full.height}px;` +
        `background:${solid};border-radius:0;z-index:41;pointer-events:none;`
      document.body.append(solidPanel)
      layer.solidPanel = solidPanel

      // El dibujo de la tarjeta aparece según se contrae: al revés que en la
      // ida, donde se retiraba justo antes de crecer.
      layer.fxCard.style.zIndex = '42'
      layer.fxCard.style.opacity = '0'

      /* La tarjeta se revela ANTES de que acabe la contracción (espejo del
         solapamiento de la ida) y el panel se retira en cuanto es opaca: si
         sobrevive a la fase 1, su estado `fill: forwards` se queda con la
         geometría intermedia y aparece como un rectángulo suelto sobre la
         billetera durante el vuelo de regreso. */
      const revealDelay = EXPAND_MS - FADE_OVERLAP_MS
      layer.fxCard.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: FADE_MS,
        delay: revealDelay,
        easing: 'cubic-bezier(0.33, 0, 0.67, 1)',
        fill: 'forwards',
      })

      await finished([
        solidPanel.animate([geom(full), geom(mid)], opts(EXPAND_MS, EASE_EXPAND)),
        solidPanel.animate([{ borderRadius: '0px' }, { borderRadius: '22px' }], opts(EXPAND_MS, EASE_EXPAND)),
        layer.fxCard.animate([geom(full), geom(mid)], opts(EXPAND_MS, EASE_EXPAND)),
        layer.fxCard.animate([{ borderRadius: '0px' }, { borderRadius: '22px' }], opts(EXPAND_MS, EASE_EXPAND)),
      ])
      solidPanel.getAnimations().forEach((a) => a.cancel())
      solidPanel.remove()
      layer.solidPanel = undefined

      // FASE 2 — la tarjeta vuelve al carrusel girando al revés, y el cuero
      // sube desde abajo a recogerla.
      const dy = window.innerHeight + origin.wallet.height - origin.wallet.top
      layer.leathers.forEach((el) => {
        el.style.transformOrigin = '50% 100%'
        el.style.transform = `translate(0, ${dy}px)`
      })

      /* La fase 1 dejó su resultado en el estado `fill: forwards` de sus
         animaciones, que PISA a los estilos inline. `commitStyles` lo vuelca al
         elemento y `cancel` las retira: sin esto, la fase 2 parte de la caja
         original y la tarjeta salta. */
      layer.fxCard.getAnimations().forEach((a) => {
        try { a.commitStyles() } catch { /* la animación ya no aplica */ }
        a.cancel()
      })
      layer.fxCard.style.opacity = '1'

      await finished([
        layer.fxCard.animate([geom(mid), geom(origin.card)], opts(FLIGHT_MS, EASE_FLIGHT)),
        spin.animate(
          [{ transform: 'rotateY(-720deg)' }, { transform: 'rotateY(0deg)' }],
          opts(FLIGHT_MS, EASE_SPIN),
        ),
        ...layer.leathers.map((el) =>
          el.animate(
            [{ transform: `translate(0, ${dy}px)` }, { transform: 'translate(0,0)' }],
            opts(WALLET_MS, EASE_FLIGHT),
          ),
        ),
      ])

        layer.under.remove()
        layer.over.remove()
      } finally {
        // Idempotente: en el camino normal las capas ya se quitaron arriba y
        // `liveLayer` sigue apuntando a ellas, así que esto no hace nada.
        liveLayer.current?.under.remove()
        liveLayer.current?.over.remove()
        liveLayer.current = null
        sessionStorage.removeItem(ORIGIN_KEY)
        // Suelta /wallets: sus animaciones de entrada corren ahora, no antes.
        document.body.classList.remove(COVERING_CLASS, SHRINKING_CLASS, LAUNCHING_CLASS)
      }
    },
    [reduceMotion],
  )

  return { launch, expandAndFade, land, retreat, dockVisible, predictedSlot }
}

export { PENDING as CARD_LANDING_KEY }
