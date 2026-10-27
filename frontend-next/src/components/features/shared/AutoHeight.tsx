'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Contenedor que ANIMA su alto cuando cambia el contenido.
 *
 * Para hojas que cambian de vista: sin esto el panel saltaba al alto nuevo y
 * recién después entraba la vista (`step-fwd`), dos tiempos. Con la misma
 * duración y curva que el paso (`--dur-step`, `--ease-sys`), alto y contenido
 * viajan juntos.
 *
 * El alto se mide con ResizeObserver, así que también acompaña cambios dentro
 * de una misma vista (un historial que termina de cargar). La primera medición
 * no anima: de `auto` a píxeles no hay transición posible.
 */
export function AutoHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    // `overflow: hidden` además recorta el desplazamiento lateral del paso,
    // que sin él asomaba como una barra de scroll horizontal.
    <div className="auto-height overflow-hidden" style={{ height }}>
      <div ref={inner}>{children}</div>
    </div>
  )
}
