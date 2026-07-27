'use client'

import { useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

import { BudgetCategoryIcon } from '@/components/features/budgets/BudgetCategoryIcon'
import { BudgetSheet } from '@/components/features/budgets/BudgetSheet'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { walletAura } from '@/lib/utils/cardVisuals'
import { useFilterStore } from '@/stores/filterStore'
import type { Budget } from '@/types'

function BudgetMiniCard({ budget, index, onOpen }: { budget: Budget; index: number; onOpen: () => void }) {
  const spent = budget.spent ?? 0
  const amount = budget.amount ?? 0
  const remaining = amount - spent
  const pctRaw = budget.percentage ?? 0
  const pct = Math.min(pctRaw, 100)
  const isOver = pctRaw > 100
  const color = budget.categoryColor ?? '#d4af37'

  // Aurora derivada del color de la categoría (mismo mesh que los wallets)
  const aura = walletAura(color)

  return (
    <div
      className="enter-pop relative flex-shrink-0 rounded-[24px]"
      style={{
        width: 'calc((100vw - 2rem - 0.75rem) / 2)',
        maxWidth: '220px',
        height: '196px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.14)',
        ['--enter-i' as string]: index,
      }}
    >
      {/* Contenedor interior: recorta la aurora (la sombra vive en el wrapper para no cortarse) */}
      <div
        className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[24px]"
        style={{ background: aura.base }}
      >
      {/* Aurora animada */}
      <div className="wallet-aura" aria-hidden>
        <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
        <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
        <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
        <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
      </div>

      {/* Textura de puntos sutil */}
      <span
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)',
          backgroundSize: '11px 11px',
        }}
      />

      {/* Notch superior con icono de categoría */}
      <div
        className="absolute left-1/2 top-0 z-[2] flex h-6 w-[66px] -translate-x-1/2 items-start justify-center rounded-b-[16px]"
        style={{ background: 'var(--bg-base)' }}
      >
        <div
          className="mt-[11px] flex h-9 w-9 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          <span style={{ color, lineHeight: 0 }}>
            <BudgetCategoryIcon name={budget.categoryIcon} size={19} />
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative z-[1] px-[15px] pb-[15px] pt-4 text-white">
        <p className="mb-2 text-[15px] font-bold leading-tight tracking-[-0.01em]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
          {budget.categoryName ?? 'Sin cat.'}
        </p>

        <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Gastado</p>
        <p className="text-[21px] font-extrabold leading-none tracking-[-0.02em]" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}>
          S/{spent.toFixed(0)} <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>/ {amount.toFixed(0)}</span>
        </p>

        {/* Barra (deja libre la zona del FAB) — fill anima con scaleX (GPU), no width */}
        <div className="mr-[42px] mt-3 h-[6px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <div
            className="enter-grow h-full rounded-full"
            style={{ width: `${pct}%`, background: isOver ? '#ffd9d0' : '#fff', ['--enter-i' as string]: index }}
          />
        </div>

        <p className="mr-[42px] mt-2 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {isOver ? `+S/${Math.abs(remaining).toFixed(0)} excedido` : `S/${remaining.toFixed(0)} rest.`}
        </p>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Editar presupuesto de ${budget.categoryName ?? 'categoría'}`}
        className="absolute bottom-[13px] right-[13px] z-[3] flex h-[34px] w-[34px] items-center justify-center rounded-full text-white transition-transform active:scale-90"
        style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <Plus size={17} strokeWidth={2.4} />
      </button>
      </div>
    </div>
  )
}

export function BudgetCarousel() {
  const walletId = useFilterStore((s) => s.walletId)
  const { data: budgets = [] } = useBudgets(walletId)
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      <div className="pt-2 -mb-3">
        {budgets.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowSheet(true)}
            className="mx-4 flex w-[calc(100%-2rem)] flex-col items-center justify-center gap-1.5 rounded-[24px] border border-dashed py-8"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-placeholder)' }}
          >
            <Plus size={18} />
            <span className="text-[11px] font-medium">Crea tu primer presupuesto</span>
          </button>
        ) : (
          // pb amplio: la sombra necesita espacio dentro del área de scroll (overflow-x
          // recorta también el overflow-y). El -mb del wrapper compensa el layout.
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-6 pt-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {budgets.map((b, i) => (
              <BudgetMiniCard key={b.id} budget={b} index={i} onOpen={() => setShowSheet(true)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSheet && <BudgetSheet onClose={() => setShowSheet(false)} />}
      </AnimatePresence>
    </>
  )
}
