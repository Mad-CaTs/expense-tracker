'use client'

import React from 'react'

import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { categoryAura, categorySwatch } from '@/lib/utils/cardVisuals'

/** Milisegundos de presión sostenida que abren el editor. */
const HOLD_MS = 550

export interface CategoryCardData {
  id: number
  name: string
  icon: string
  color: string
  total: number
  count: number
  percentage: number
}

export interface CategoryCardProps {
  category: CategoryCardData
  index: number
  /** Toque corto: ver los movimientos de la categoría. */
  onOpen: () => void
  /** Presión sostenida: editar. */
  onEdit: () => void
}

/**
 * Tarjeta de categoría del grid: aurora derivada de su color (mismo lenguaje que
 * BudgetCarousel). Las categorías sin movimientos en el mes se atenúan y pierden
 * la aurora — siguen siendo editables, pero no compiten con las que sí gastaron.
 *
 * Interacción de dos niveles sobre el mismo elemento: toque corto abre los
 * movimientos (el uso frecuente), presión sostenida abre el editor. La barra
 * inferior se llena durante la presión para que el gesto sea visible mientras
 * ocurre.
 */
export function CategoryCard({ category, index, onOpen, onEdit }: CategoryCardProps) {
  const { name, icon, color, total, count, percentage } = category
  const Icon = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.ellipsis
  const unused = total <= 0

  // Aurora atenuada (ver categoryAura): mismo lenguaje que las tarjetas de
  // wallet pero con el color como tinte, porque acá conviven muchas en un grid.
  // Se mantiene en AMBOS temas — es una superficie de color propia, no una card
  // del tema, y su texto va en blanco.
  const aura = categoryAura(color)
  // El icono sobre el círculo blanco usa el tono atenuado, igual que el resto
  // de la app: el hex crudo del preset ahí se ve fluorescente.
  const iconColor = categorySwatch(color)

  const [holding, setHolding] = React.useState(false)
  const timer = React.useRef<number | null>(null)
  const fired = React.useRef(false)

  const clear = React.useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setHolding(false)
  }, [])

  React.useEffect(() => clear, [clear])

  function onPointerDown() {
    fired.current = false
    setHolding(true)
    timer.current = window.setTimeout(() => {
      fired.current = true
      clear()
      // Al abrirse el editor el puntero SIGUE abajo: el menú contextual se
      // dispararía al soltar, y para entonces el objetivo ya no es la tarjeta
      // sino el sheet, así que su onContextMenu no alcanza. Se suprime a nivel
      // documento por una ventana corta, hasta que el gesto se complete.
      const block = (e: Event) => e.preventDefault()
      document.addEventListener('contextmenu', block, true)
      // Y lo mismo con la selección: el gesto de sostener arrastra una, y el
      // sheet monta con el puntero abajo, así que el navegador la extiende
      // hasta su título. `select-none` acá no alcanza — el texto que termina
      // resaltado es el del sheet, que todavía no existía al empezar.
      const deselect = () => window.getSelection()?.removeAllRanges()
      document.addEventListener('selectionchange', deselect, true)
      window.setTimeout(() => {
        document.removeEventListener('contextmenu', block, true)
        document.removeEventListener('selectionchange', deselect, true)
        deselect()
      }, 900)
      onEdit()
    }, HOLD_MS)
  }

  function onClick() {
    // El click posterior a un long-press ya fue atendido por onEdit.
    if (fired.current) {
      fired.current = false
      return
    }
    onOpen()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${name}. Toca para ver movimientos, mantén para editar.`}
      className={`enter-pop relative flex min-h-[172px] cursor-pointer select-none flex-col overflow-hidden rounded-[20px] text-left transition-transform active:scale-[0.985] ${unused ? 'opacity-50' : ''}`}
      style={{
        // Mantener presionado ES, para el navegador, el gesto que abre el menú
        // contextual y arrastra una selección. Como acá ese gesto significa
        // "editar", hay que desactivar ambas respuestas nativas: `select-none`
        // evita que se subraye el texto de la tarjeta y `touch-callout` impide
        // el menú de iOS al sostener.
        WebkitTouchCallout: 'none',
        background: unused ? 'var(--bg-card-inner)' : aura.base,
        // Sin aurora que las delimite, las atenuadas quedarían como manchas
        // casi invisibles sobre el fondo: el borde las mantiene tarjeta.
        border: unused ? '1px solid var(--border-subtle)' : 'none',
        boxShadow: unused ? 'none' : '0 1px 3px rgba(0,0,0,0.14)',
        ['--enter-i' as string]: index,
      }}
    >
      {/* Aurora animada: solo en las que tuvieron movimiento. El blur vive en
          cada blob, nunca en el contenedor (coste de composición en móvil). */}
      {!unused && (
        <span className="wallet-aura aura-soft" aria-hidden>
          <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
          <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
          <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
          <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
        </span>
      )}

      {/* Textura de puntos sutil, igual que las tarjetas de presupuesto. */}
      {!unused && (
        <span
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
          aria-hidden
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)',
            backgroundSize: '11px 11px',
          }}
        />
      )}

      {/* Notch con el icono: recorta el borde superior contra el fondo de la
          página. El círculo va en blanco y el icono toma el color de la
          categoría, al revés que el chip translúcido anterior. */}
      <span
        className="absolute left-1/2 top-0 z-[2] flex h-6 w-[66px] -translate-x-1/2 items-start justify-center rounded-b-[16px]"
        style={{ background: 'var(--bg-base)' }}
        aria-hidden
      >
        <span
          className="mt-[11px] flex h-9 w-9 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          <Icon size={17} style={{ color: iconColor }} strokeWidth={1.9} />
        </span>
      </span>

      {/* Empuja el contenido abajo dejando sitio al notch. */}
      <span className="flex-1" aria-hidden />

      {/* Con aurora el texto va SIEMPRE en blanco (como las tarjetas de wallet
          en /expenses): la superficie es de color propio y no sigue al tema.
          Las atenuadas sí son una card del tema, y usan sus tokens. */}
      <span className="relative z-[1] block px-[14px] pb-[14px]">
        <span
          className="mb-2 block truncate text-[14.5px] font-extrabold tracking-[-0.01em]"
          style={{
            color: unused ? 'var(--text-primary)' : '#fff',
            ...(unused ? {} : { textShadow: '0 1px 8px rgba(0,0,0,0.2)' }),
          }}
        >
          {name}
        </span>
        <span
          className="mono-amount block text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums"
          style={{
            color: unused ? 'var(--text-primary)' : '#fff',
            ...(unused ? {} : { textShadow: '0 1px 10px rgba(0,0,0,0.25)' }),
          }}
        >
          S/{total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </span>

        {/* Porción del gasto del mes. En las sin movimientos la barra queda
            vacía en vez de desaparecer: así todas las tarjetas miden igual. */}
        <span
          className="mt-[11px] block h-[6px] overflow-hidden rounded-full"
          style={{ background: unused ? 'var(--border-subtle)' : 'rgba(255,255,255,0.25)' }}
        >
          <span
            className="enter-grow block h-full rounded-full"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: unused ? 'var(--text-muted)' : '#fff',
              ['--enter-i' as string]: index,
            }}
          />
        </span>

        <span
          className="mt-[7px] block text-[11px] font-semibold"
          style={{ color: unused ? 'var(--text-muted)' : 'rgba(255,255,255,0.85)' }}
        >
          {unused ? 'sin movimientos' : `${count} mov${count === 1 ? '' : 's'} · ${Math.round(percentage)}%`}
        </span>
      </span>

      {/* Progreso de la presión sostenida: hace visible el gesto mientras ocurre. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 right-0 z-[2] h-[3px] origin-left"
        style={{
          background: unused ? 'var(--text-primary)' : '#fff',
          transform: holding ? 'scaleX(1)' : 'scaleX(0)',
          transition: holding ? `transform ${HOLD_MS}ms linear` : 'transform 120ms var(--ease-sys)',
        }}
      />
    </button>
  )
}
