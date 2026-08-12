'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { MOTION } from '@/lib/utils/motion'

interface SheetProps {
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Cierre ANIMADO, para que un hijo (un formulario que terminó de guardar) no
 * tenga que desmontar el sheet de golpe. Llamar al `close` del store salta la
 * animación de salida: el panel desaparece de un frame al otro.
 */
const SheetCloseContext = createContext<(() => void) | null>(null)

export function useSheetClose(): () => void {
  const close = useContext(SheetCloseContext)
  if (!close) throw new Error('useSheetClose debe usarse dentro de un <Sheet>')
  return close
}

/** Arrastre hacia abajo que cierra el sheet, en px o en velocidad. */
const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 0.55

/**
 * Bottom sheet. La entrada y la salida corren por CSS (`sheet-in`/`sheet-out`),
 * no por framer: la convención del proyecto es animar por compositor y dejar
 * framer para la interacción. Animado por JS, cada frame de un panel de este
 * tamaño —con sus campos, chips y selectores— pasa por el hilo principal y el
 * despliegue se siente con lag.
 *
 * El arrastre para descartar sí es interacción, así que se maneja a mano con
 * eventos de puntero y `transform` directo sobre el nodo.
 */
export function Sheet({ onClose, title, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startTime = useRef(0)
  const dragging = useRef(false)

  const [closing, setClosing] = useState(false)
  const [sliding, setSliding] = useState(true)
  const exitTimer = useRef<number | null>(null)

  // `sliding` nace en true: acá solo hay que apagarlo al aterrizar.
  useEffect(() => {
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => {
      window.clearTimeout(t)
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    }
  }, [])

  /** El desmontaje espera a que la salida termine. */
  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setSliding(true)
    setClosing(true)
    exitTimer.current = window.setTimeout(onClose, MOTION.sheet)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  function onPointerDown(e: React.PointerEvent) {
    // Solo desde el handle: dentro del formulario el gesto vertical es scroll.
    if (!(e.target as HTMLElement).closest('[data-sheet-handle]')) return
    dragging.current = true
    startY.current = e.clientY
    startTime.current = Date.now()
    panel.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !panel.current) return
    const dy = Math.max(0, e.clientY - startY.current)
    // transform directo: sin pasar por React, el arrastre sigue al dedo.
    panel.current.style.transform = `translate3d(0, ${dy}px, 0)`
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current || !panel.current) return
    dragging.current = false
    panel.current.releasePointerCapture(e.pointerId)

    const dy = e.clientY - startY.current
    const velocity = dy / Math.max(1, Date.now() - startTime.current)
    panel.current.style.transform = ''

    if (dy > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) close()
  }

  return (
    <SheetCloseContext.Provider value={close}>
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.45)',
          opacity: closing ? 0 : 1,
          transition: `opacity ${MOTION.sheet}ms var(--ease-sys)`,
        }}
        onClick={close}
      />

      <div
        ref={panel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // Mismo material que los sheets de categorías y frecuentes.
        className={`liquid-glass relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[24px] border-b-0 ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-hidden'}`}
        style={{
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
      >
        <div data-sheet-handle className="flex cursor-grab justify-center pb-1 pt-3 active:cursor-grabbing">
          <span className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {title && (
          <p className="px-4 pb-1 pt-2 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {title}
          </p>
        )}

        {/* `contain` aísla el contenido: los formularios disparan sus queries
            (categorías, billeteras) al montarse, y ese re-render invalidaba el
            layout del panel a mitad de la animación.

            Va SIEMPRE puesto, no solo durante el recorrido. Alternarlo era peor
            que no tenerlo: quitarlo al aterrizar re-expone todo el subárbol al
            layout del panel en ese mismo frame, y eso es lo que se veía como un
            segundo tiempo al abrir. `content-visibility` tampoco va, por lo
            mismo — difería el pintado y lo cobraba todo junto al final. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]"
          style={{ contain: 'layout paint style' }}
        >
          {children}
        </div>
      </div>
    </div>
    </SheetCloseContext.Provider>
  )
}
