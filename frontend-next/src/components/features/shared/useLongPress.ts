'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Milisegundos de presión sostenida que disparan la acción secundaria. */
export const HOLD_MS = 550

/**
 * Gesto de dos niveles sobre un mismo elemento: toque corto y presión sostenida.
 *
 * Mantener presionado ES, para el navegador, el gesto que abre el menú
 * contextual y arrastra una selección. Al usarlo como acción hay que desactivar
 * ambas respuestas nativas — de ahí que se devuelvan también los estilos, y que
 * el menú se suprima a nivel documento durante una ventana corta: cuando la
 * acción abre una capa nueva, el puntero SIGUE abajo y al soltar el evento cae
 * sobre otro objetivo, así que un handler local no alcanza.
 */
export function useLongPress({ onPress, onHold }: { onPress: () => void; onHold: () => void }) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | null>(null)
  const fired = useRef(false)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setHolding(false)
  }, [])

  useEffect(() => clear, [clear])

  const handlers = {
    onPointerDown: () => {
      fired.current = false
      setHolding(true)
      timer.current = window.setTimeout(() => {
        fired.current = true
        clear()
        const block = (e: Event) => e.preventDefault()
        document.addEventListener('contextmenu', block, true)
        window.setTimeout(() => document.removeEventListener('contextmenu', block, true), 900)
        onHold()
      }, HOLD_MS)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => {
      // El click que sigue a un long-press ya fue atendido por onHold.
      if (fired.current) {
        fired.current = false
        return
      }
      onPress()
    },
  }

  /** Evita que el navegador subraye el texto o muestre el callout al sostener. */
  const style = { WebkitTouchCallout: 'none' } as const

  return { holding, handlers, style }
}
