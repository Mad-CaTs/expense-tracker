'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { DebtItem } from '@/types'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Fila del reparto: es `DebtItem` más una `key` de UI.
 *
 * <p>La key vive acá y NO en `DebtItem` (que es el payload de la API) porque la
 * necesita la animación: con `key={índice}`, quitar a la persona del medio
 * animaba la salida de la fila equivocada.
 */
export interface SplitRow extends DebtItem {
  key: string
}

interface ExpenseSplitFieldProps {
  items: SplitRow[]
  /** Importe del gasto; de él se descuenta el reparto para la parte propia. */
  total: number
  error?: string
  onChange: (items: SplitRow[]) => void
}

/**
 * Paso de reparto: con quién se comparte el gasto.
 *
 * <p>Es un paso propio y no un bloque plegable dentro de "cuánto y en qué":
 * ahí competía con el monto y la categoría, que es lo que de verdad se está
 * respondiendo en ese momento.
 *
 * <p>La parte propia se CALCULA (total − repartido); nunca se teclea, así no
 * puede descuadrar.
 */
/** Contador para la key de cada fila; ver `SplitRow.key`. */
let rowSeq = 0
const nextKey = () => `r${rowSeq++}`

export function ExpenseSplitField({ items, total, error, onChange }: ExpenseSplitFieldProps) {
  const shared = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
  const mine = total - shared

  const update = (index: number, patch: Partial<SplitRow>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  return (
    <>
      <p className="mb-3 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Compartir gasto
      </p>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => onChange([{ key: nextKey(), personName: '', amount: 0 }])}
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] text-[13px] font-bold transition-transform active:scale-[0.99]"
          style={{ border: '1px dashed var(--border-default)', color: 'var(--text-tertiary)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Añadir a alguien
        </button>
      ) : (
        <>
          <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: MOTION_S.layer, ease: EASE }}
              className="mb-2.5 flex items-center gap-2 overflow-hidden">
              <input
                value={item.personName}
                onChange={(e) => update(i, { personName: e.target.value })}
                placeholder="Nombre"
                autoComplete="off"
                maxLength={FIELD_LIMITS.personName}
                className="liquid-glass-ic h-[46px] min-w-0 flex-1 rounded-[16px] px-[15px] text-[14px] font-semibold outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <input
                value={item.amount || ''}
                onChange={(e) => {
                  // Solo dígitos y un punto: el teclado numérico de móvil deja
                  // colar comas y letras.
                  const raw = e.target.value.replace(/[^0-9.]/g, '')
                  update(i, { amount: Number(raw) || 0 })
                }}
                inputMode="decimal"
                placeholder="0.00"
                className="liquid-glass-ic mono-amount h-[46px] w-[96px] flex-none rounded-[16px] px-[13px] text-right text-[14px] font-bold tabular-nums outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, x) => x !== i))}
                aria-label={`Quitar a ${item.personName || 'esta persona'}`}
                className="flex h-[30px] w-[30px] flex-none cursor-pointer items-center justify-center rounded-full transition-transform active:scale-90"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => onChange([...items, { key: nextKey(), personName: '', amount: 0 }])}
            className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[14px] text-[12.5px] font-bold transition-transform active:scale-[0.99]"
            style={{ border: '1px dashed var(--border-default)', color: 'var(--text-tertiary)' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Añadir otra persona
          </button>

          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_S.tint, ease: EASE }}
            className="mt-4 flex items-center justify-between rounded-[16px] px-[15px] py-3.5"
            style={{ background: 'var(--bg-hover)' }}
          >
            <span className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              Tu parte
            </span>
            <b
              className="mono-amount text-[19px] font-extrabold tabular-nums tracking-[-0.02em]"
              style={{ color: mine < 0 ? 'var(--danger)' : 'var(--text-primary)' }}
            >
              S/ {money(Math.max(mine, 0))}
            </b>
          </motion.div>
        </>
      )}

      {error && (
        <p className="mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </>
  )
}
