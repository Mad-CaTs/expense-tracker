'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 0.55

export function Sheet({ onClose, title, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startTime = useRef(0)
  const dragging = useRef(false)

  const [closing, setClosing] = useState(false)
  const [sliding, setSliding] = useState(true)
  const exitTimer = useRef<number | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => {
      window.clearTimeout(t)
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    }
  }, [])

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
    if (!(e.target as HTMLElement).closest('[data-sheet-handle]')) return
    dragging.current = true
    startY.current = e.clientY
    startTime.current = Date.now()
    panel.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !panel.current) return
    const dy = Math.max(0, e.clientY - startY.current)
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

  // Montado en el `<body>` por portal, como ColorPickerSheet.
  //
  // `position: fixed` se resuelve contra el viewport SALVO que un ancestro
  // tenga `transform`, que entonces pasa a ser su bloque contenedor. El
  // carrusel del onboarding desplaza sus slides con `translate3d`, así que un
  // sheet abierto desde ahí se anclaba al slide y aparecía fuera de pantalla
  // (left = -1560) en vez de sobre el viewport. Al `<body>` no hay ancestro
  // transformado que lo capture, venga de donde venga.
  //
  // En SSR no hay `document`; el sheet solo existe tras una interacción, así
  // que no renderizar nada en el servidor no cambia el HTML inicial.
  if (typeof document === 'undefined') return null

  return createPortal(
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
    </SheetCloseContext.Provider>,
    document.body
  )
}
