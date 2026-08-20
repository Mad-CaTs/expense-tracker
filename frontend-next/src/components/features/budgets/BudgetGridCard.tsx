'use client'

import React from 'react'

import { BudgetCategoryIcon } from '@/components/features/budgets/BudgetCategoryIcon'
import { NEAR_LIMIT_PCT } from '@/components/features/budgets/BudgetsHero'
import { categoryAura, categorySwatch } from '@/lib/utils/cardVisuals'
import type { Budget } from '@/types'

const HOLD_MS = 550

export interface BudgetGridCardProps {
  budget: Budget
  index: number
  onOpen: () => void
  onEdit: () => void
}

export function BudgetGridCard({ budget, index, onOpen, onEdit }: BudgetGridCardProps) {
  const spent = budget.spent ?? 0
  const amount = budget.amount ?? 0
  const remaining = amount - spent
  const pctRaw = budget.percentage ?? 0
  const pct = Math.min(pctRaw, 100)
  const isOver = pctRaw > 100
  const isNear = pctRaw > NEAR_LIMIT_PCT && !isOver
  const color = budget.categoryColor ?? '#d4af37'

  const aura = categoryAura(color)
  const iconColor = categorySwatch(color)
  const barColor = isOver ? '#ffd9d0' : isNear ? '#ffe0a3' : '#fff'

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

      const block = (e: Event) => e.preventDefault()
      document.addEventListener('contextmenu', block, true)

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
      aria-label={`${budget.categoryName ?? 'Categoría'}. Toca para ver movimientos, mantén para editar el límite.`}
      className="enter-pop relative flex min-h-[172px] cursor-pointer select-none flex-col justify-end overflow-hidden rounded-[20px] text-left transition-transform active:scale-[0.985]"
      style={{
        WebkitTouchCallout: 'none',
        background: aura.base,
        boxShadow: '0 1px 3px rgba(0,0,0,0.14)',
        ['--enter-i' as string]: index,
      }}
    >
      {/* El blur vive en cada blob, nunca en el contenedor (coste de
          composición en móvil). */}
      <span className="wallet-aura aura-soft" aria-hidden>
        <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
        <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
        <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
        <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
      </span>

      {/* Textura de puntos sutil, igual que en el carrusel de /expenses. */}
      <span
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)',
          backgroundSize: '11px 11px',
        }}
      />

      {/* Notch con el icono de la categoría: recorta el borde superior contra
          el fondo de la página, como las mini-tarjetas de /expenses. */}
      <span
        className="absolute left-1/2 top-0 z-[2] flex h-6 w-[66px] -translate-x-1/2 items-start justify-center rounded-b-[16px]"
        style={{ background: 'var(--bg-base)' }}
        aria-hidden
      >
        <span
          className="mt-[11px] flex h-9 w-9 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          <span style={{ color: iconColor, lineHeight: 0 }}>
            <BudgetCategoryIcon name={budget.categoryIcon} size={19} />
          </span>
        </span>
      </span>

      {isOver && (
        <span
          className="absolute right-[11px] top-[11px] z-[2] rounded-full px-[7px] py-[3px] text-[9.5px] font-extrabold tracking-[0.04em]"
          style={{ background: 'rgba(0,0,0,0.42)', color: '#ffd9d0' }}
        >
          EXCEDIDO
        </span>
      )}

      {/* Con aurora el texto va SIEMPRE en blanco: la superficie es de color
          propio y no sigue al tema. */}
      <span className="relative z-[1] block px-[14px] pb-[14px] pt-4 text-white">
        <span className="mb-2 block truncate text-[14.5px] font-extrabold tracking-[-0.01em]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
          {budget.categoryName ?? 'Sin categoría'}
        </span>

        <span className="mono-amount block text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}>
          S/{spent.toFixed(0)}{' '}
          <span className="text-[11.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            / {amount.toFixed(0)}
          </span>
        </span>

        <span className="mt-[11px] block h-[6px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <span className="enter-grow block h-full rounded-full" style={{ width: `${pct}%`, background: barColor, ['--enter-i' as string]: index }} />
        </span>

        <span className="mt-[7px] block text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {isOver ? `+S/${Math.abs(remaining).toFixed(0)} excedido` : `S/${remaining.toFixed(0)} rest.`}
        </span>
      </span>

      {/* Progreso de la presión sostenida: hace visible el gesto mientras ocurre. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 right-0 z-[3] h-[3px] origin-left"
        style={{
          background: '#fff',
          transform: holding ? 'scaleX(1)' : 'scaleX(0)',
          transition: holding ? `transform ${HOLD_MS}ms linear` : 'transform 120ms var(--ease-sys)',
        }}
      />
    </button>
  )
}
