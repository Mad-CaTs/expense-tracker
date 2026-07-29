'use client'

import React from 'react'

import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { categoryAura } from '@/lib/utils/cardVisuals'

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
      window.setTimeout(() => document.removeEventListener('contextmenu', block, true), 900)
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
      className={`enter-pop relative flex min-h-[114px] cursor-pointer select-none flex-col justify-between overflow-hidden rounded-[20px] p-[13px] text-left transition-transform active:scale-[0.985] ${unused ? 'opacity-50' : ''}`}
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

      {/* Con aurora el texto va SIEMPRE en blanco (como las tarjetas de wallet
          en /expenses): la superficie es de color propio y no sigue al tema.
          Las atenuadas sí son una card del tema, y usan sus tokens. */}
      <span
        className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-[10px]"
        style={{ background: unused ? `${color}30` : 'rgba(255,255,255,0.18)' }}
      >
        <Icon size={15} style={{ color: unused ? color : '#fff' }} strokeWidth={1.9} />
      </span>

      <span className="relative z-[1] block">
        <span
          className="block truncate text-[13.5px] font-extrabold tracking-[-0.02em]"
          style={{ color: unused ? 'var(--text-primary)' : 'rgba(255,255,255,0.82)' }}
        >
          {name}
        </span>
        <span
          className="mono-amount mt-0.5 block text-[17px] font-extrabold tracking-[-0.02em] tabular-nums"
          style={{
            color: unused ? 'var(--text-primary)' : '#fff',
            ...(unused ? {} : { textShadow: '0 1px 18px rgba(0,0,0,0.25)' }),
          }}
        >
          S/ {total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </span>
        <span
          className="mt-px block text-[10.5px]"
          style={{ color: unused ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)' }}
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
