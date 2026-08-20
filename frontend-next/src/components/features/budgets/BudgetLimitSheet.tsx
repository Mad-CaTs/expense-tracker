'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

import { BudgetCategoryIcon } from '@/components/features/budgets/BudgetCategoryIcon'
import { NEAR_LIMIT_PCT } from '@/components/features/budgets/BudgetsHero'
import { useUpdateBudget } from '@/lib/hooks/useBudgets'
import { categoryAura } from '@/lib/utils/cardVisuals'
import { MOTION } from '@/lib/utils/motion'
import type { Budget } from '@/types'

export interface BudgetLimitSheetProps {
  budget: Budget
  onClose: () => void
  /** Nombre de la categoría, YA cerrado el sheet: para el aviso de éxito. */
  onSaved?: (categoryName: string) => void
  onDelete?: (id: number) => void
}

/**
 * Tarjeta que refleja el límite que se está escribiendo: sirve para ver, antes
 * de guardar, si lo ya gastado cabe en el nuevo límite o lo excede.
 */
function Preview({ budget, limit }: { budget: Budget; limit: number }) {
  const spent = budget.spent ?? 0
  const color = budget.categoryColor ?? '#d4af37'
  const aura = categoryAura(color)

  const pctRaw = limit > 0 ? (spent / limit) * 100 : 0
  const isOver = pctRaw > 100
  const isNear = pctRaw > NEAR_LIMIT_PCT && !isOver
  const remaining = limit - spent
  const barColor = isOver ? '#ffd9d0' : isNear ? '#ffe0a3' : '#fff'

  return (
    <div
      className="relative mb-4 flex h-[132px] flex-col overflow-hidden rounded-[20px]"
      style={{ background: aura.base }}
    >
      <span className="wallet-aura aura-soft" aria-hidden>
        <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
        <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
        <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
        <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
      </span>

      {/* Sobre la aurora, --text-placeholder no contrasta: va en blanco tenue. */}
      <span className="absolute right-[13px] top-3 z-[2] text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Vista previa
      </span>

      {/* El icono va en el FLUJO, no en absolute: el bloque de abajo crece
          hacia arriba y con un nombre largo se le montaría encima. */}
      <span className="relative z-[1] flex flex-1 items-start px-[14px] pt-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <span style={{ color: '#fff', lineHeight: 0 }}>
            <BudgetCategoryIcon name={budget.categoryIcon} size={16} />
          </span>
        </span>
      </span>

      <span className="relative z-[1] block px-[14px] pb-[14px] text-white">
        <span className="mb-1.5 block truncate text-[13.5px] font-extrabold tracking-[-0.01em]">
          {budget.categoryName ?? 'Sin categoría'}
        </span>
        <span className="mono-amount block text-[19px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">
          S/{spent.toFixed(0)}{' '}
          <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            / {limit > 0 ? limit.toFixed(0) : '—'}
          </span>
        </span>
        <span className="mt-2.5 block h-[6px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <span
            className="block h-full rounded-full"
            style={{
              width: `${Math.min(pctRaw, 100)}%`,
              background: barColor,
              transition: 'width var(--dur-layer) var(--ease-sys), background-color var(--dur-tint) var(--ease-sys)',
            }}
          />
        </span>
        <span className="mt-[7px] block text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {limit <= 0
            ? 'Define un límite'
            : isOver
              ? `+S/${Math.abs(remaining).toFixed(0)} excedido`
              : `S/${remaining.toFixed(0)} rest.`}
        </span>
      </span>
    </div>
  )
}

/**
 * Edición del límite de un presupuesto.
 *
 * Un solo paso, a diferencia de los formularios de movimiento: la categoría y
 * la cuenta ya están fijadas por el presupuesto que se abrió, así que lo único
 * que se decide acá es el monto.
 */
export function BudgetLimitSheet({ budget, onClose, onSaved, onDelete }: BudgetLimitSheetProps) {
  const update = useUpdateBudget()

  const [amount, setAmount] = useState(String(budget.amount ?? ''))
  const [error, setError] = useState('')

  /** Cubre el recorrido del panel y apaga lo caro mientras dura: la aurora del
   *  preview combina blur, blend y animación infinita (ver .is-sliding). */
  const [sliding, setSliding] = useState(true)
  const [closing, setClosing] = useState(false)
  const exitTimer = useRef<number | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => {
      window.clearTimeout(t)
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    }
  }, [])

  /** El desmontaje espera a que la salida termine: sin framer, AnimatePresence
   *  no retiene el árbol y el panel desaparecería de golpe. */
  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setSliding(true)
    setClosing(true)
    exitTimer.current = window.setTimeout(onClose, MOTION.sheet)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  async function handleSubmit() {
    const parsed = Number(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Monto inválido')
      return
    }
    await update.mutateAsync({ id: budget.id, amount: parsed })
    close()

    window.setTimeout(() => onSaved?.(budget.categoryName ?? ''), MOTION.sheet)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={close}>
      <div
        className={`liquid-glass max-h-[88dvh] w-full max-w-sm select-none rounded-t-[24px] border-b-0 sm:max-w-md sm:rounded-[24px] ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-y-auto'}`}
        style={{
          backdropFilter: sliding ? 'none' : 'blur(40px) saturate(1.7)',
          WebkitBackdropFilter: sliding ? 'none' : 'blur(40px) saturate(1.7)',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="px-4 pb-5 pt-2">
          <p className="mb-3.5 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Editar límite
          </p>

          <Preview budget={budget} limit={Number(amount) || 0} />

          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Límite mensual
          </p>
          <div
            className="liquid-glass-ic flex h-[58px] w-full items-center gap-2 rounded-[16px] px-[15px]"
            style={error ? { borderColor: 'var(--danger)' } : undefined}
          >
            <span className="text-[19px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d.]/g, '')
                setAmount(clean)
                setError('')
              }}
              placeholder="0.00"
              autoComplete="off"
              className="mono-amount w-full bg-transparent text-[26px] font-extrabold tracking-[-0.02em] tabular-nums outline-none"
              style={{ color: Number(amount) > 0 ? 'var(--text-primary)' : 'var(--text-placeholder)' }}
            />
          </div>
          {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="mt-5 flex gap-2">
            {onDelete && (
              <motion.button
                type="button"
                onClick={() => { close(); window.setTimeout(() => onDelete(budget.id), MOTION.sheet) }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                aria-label="Eliminar presupuesto"
                className="flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-full"
                style={{ background: 'var(--bg-hover)', color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={close}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-11 flex-1 cursor-pointer rounded-full text-[13px] font-semibold"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={update.isPending}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-11 flex-1 cursor-pointer rounded-full text-[13px] font-bold disabled:opacity-60"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              {update.isPending ? 'Guardando...' : 'Guardar'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
