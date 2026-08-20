'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const HOLD_MS = 550

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
      if (fired.current) {
        fired.current = false
        return
      }
      onPress()
    },
  }

  const style = { WebkitTouchCallout: 'none' } as const

  return { holding, handlers, style }
}
