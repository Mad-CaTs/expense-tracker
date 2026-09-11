'use client'

import { useCallback, useEffect, useRef } from 'react'

/** Movimiento mínimo antes de comprometerse a arrastrar: por debajo de esto el
 *  gesto sigue siendo un tap y no se roba el clic. */
const HYSTERESIS_PX = 14
/** Cuánto hay que bajar (o proyectar) para que la tarjeta se vaya a /wallets. */
const COMMIT_PX = 168
/** Recorrido mínimo real, por rápido que sea el gesto: la proyección sola
 *  convertía cualquier toque con algo de prisa en una salida. */
const MIN_TRAVEL_PX = 96
/** La tarjeta avanza MENOS que el dedo: hay que arrastrar más para recorrer lo
 *  mismo, y el gesto se siente pesado en vez de disparado. */
const DRAG_FACTOR = 0.55
/** Deceleración del scroll de iOS: proyecta dónde acabaría el gesto por inercia
 *  en vez de decidir con la posición al soltar. */
const DECELERATION = 0.998
/** Tope a lo que aporta la inercia. Sin él, 0.998 —pensado para superficies de
 *  scroll largas— multiplica por ~500 la velocidad: un tirón de 36 px proyectaba
 *  223 px y se iba solo. Acotado, el flick cuenta sin dispararse. */
const MAX_PROJECTION_PX = 70

const project = (velocity: number) => {
  const raw = ((velocity / 1000) * DECELERATION) / (1 - DECELERATION)
  return Math.max(-MAX_PROJECTION_PX, Math.min(MAX_PROJECTION_PX, raw))
}

interface Options {
  /** Se dispara cuando el gesto decide irse. Recibe la velocidad al soltar
   *  (px/s) para que la animación de salida la herede sin costura. */
  onCommit: (velocity: number) => void
  disabled?: boolean
}

/**
 * Deslizar la tarjeta hacia abajo para volver a /wallets.
 *
 * Sigue el dedo 1:1 mientras dura el gesto y decide al soltar proyectando la
 * inercia, no con la posición final: un tirón corto y rápido cuenta igual que
 * un arrastre largo y lento, que es como se comporta el resto del sistema.
 */
export function useSwipeDownCard({ onCommit, disabled = false }: Options) {
  const ref = useRef<HTMLElement | null>(null)
  const drag = useRef<{ id: number; startY: number; y: number; t: number; vy: number; active: boolean } | null>(null)
  const committed = useRef(false)

  const paint = useCallback((dy: number) => {
    const el = ref.current
    if (!el) return
    el.style.transform = dy === 0 ? '' : `translateY(${dy}px)`
  }, [])

  const settle = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.42s cubic-bezier(0.23, 1, 0.32, 1)'
    el.style.transform = ''
    window.setTimeout(() => {
      if (el) el.style.transition = ''
    }, 440)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    const onDown = (e: PointerEvent) => {
      if (committed.current) return
      drag.current = { id: e.pointerId, startY: e.clientY, y: e.clientY, t: performance.now(), vy: 0, active: false }
      el.style.transition = ''
    }

    const onMove = (e: PointerEvent) => {
      const d = drag.current
      if (!d || e.pointerId !== d.id) return

      const raw = e.clientY - d.startY
      if (!d.active) {
        // Solo HACIA ABAJO: un arrastre que empieza subiendo no es este gesto y
        // se ignora por completo, en vez de mover la tarjeta hacia arriba.
        if (raw < HYSTERESIS_PX) return
        d.active = true
        // Capturar acá y no en el down: así un tap limpio nunca pierde su clic.
        el.setPointerCapture(e.pointerId)
      }

      const now = performance.now()
      const dt = now - d.t
      if (dt > 0) d.vy = ((e.clientY - d.y) / dt) * 1000
      d.y = e.clientY
      d.t = now

      // La tarjeta nunca sube de su sitio: por encima del origen se queda
      // clavada en 0. Debajo sigue al dedo, amortiguada (ver DRAG_FACTOR).
      paint(raw <= 0 ? 0 : raw * DRAG_FACTOR)
      e.preventDefault()
    }

    const finish = (e: PointerEvent) => {
      const d = drag.current
      if (!d || e.pointerId !== d.id) return
      drag.current = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      if (!d.active) return

      // Se decide con el recorrido del DEDO, no con el de la tarjeta: los
      // umbrales están expresados en distancia arrastrada.
      const travelled = e.clientY - d.startY
      const projected = travelled + project(d.vy)

      if (projected > COMMIT_PX && travelled >= MIN_TRAVEL_PX) {
        committed.current = true
        onCommit(d.vy)
        return
      }
      settle()
    }

    /* Si la salida no llegó a navegar —la animación se cortó, o la pestaña
       volvió del fondo a medias—, `committed` se quedaba en true y el gesto
       moría para siempre: la tarjeta ya no respondía al dedo. Volver a la
       pantalla lo rearma. */
    const rearm = () => {
      if (document.visibilityState !== 'visible') return
      committed.current = false
      drag.current = null
      el.style.transition = ''
      el.style.transform = ''
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', finish)
    el.addEventListener('pointercancel', finish)
    document.addEventListener('visibilitychange', rearm)
    window.addEventListener('pageshow', rearm)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', finish)
      el.removeEventListener('pointercancel', finish)
      document.removeEventListener('visibilitychange', rearm)
      window.removeEventListener('pageshow', rearm)
    }
  }, [disabled, onCommit, paint, settle])

  return ref
}
