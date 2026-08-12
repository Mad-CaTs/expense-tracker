'use client'

import { motion } from 'framer-motion'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { EASE, MOTION_S } from '@/lib/utils/motion'

export interface CategoriesHeroProps {
  /** Gastado o recibido en el mes, según el tipo activo. */
  total: number
  isExpense: boolean
  topCategory: string | null
  categoryCount: number
  movementCount: number
}

/**
 * Metadato del hero. Con `count`, el número recorre hasta su nuevo valor; con
 * `value` (un nombre, que no se puede interpolar) el texto hace un fundido
 * corto para que el cambio no pase desapercibido.
 */
function Metric({ label, value, count }: { label: string; value?: string; count?: number }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      <p className="mt-[3px] truncate text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {count != null
          ? <AnimatedAmount value={count} fractionDigits={0} animateOnMount />
          : <motion.span key={value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: MOTION_S.tint, ease: EASE }}>{value}</motion.span>}
      </p>
    </div>
  )
}

/**
 * Cabecera de /categories: el total del mes manda y el resto queda como
 * metadato. Reemplaza a los tres SummaryStat en grid-cols-3, cuyas etiquetas de
 * 8.5px eran ilegibles y competían entre sí sin jerarquía.
 */
export function CategoriesHero({ total, isExpense, topCategory, categoryCount, movementCount }: CategoriesHeroProps) {
  return (
    <div className="liquid-glass mx-4 mb-3.5 rounded-[22px] p-[18px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-placeholder)' }}>
        {isExpense ? 'Gastado este mes' : 'Recibido este mes'}
      </p>
      <p className="mono-amount mt-[7px] text-[33px] font-extrabold leading-[1.05] tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
        <small className="mr-[5px] text-[19px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</small>
        <AnimatedAmount value={total} animateOnMount />
      </p>
      <div className="mt-3.5 flex gap-4 border-t pt-3.5" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <Metric label="Top" value={topCategory ?? '—'} />
        <Metric label="Categorías" count={categoryCount} />
        <Metric label="Movs." count={movementCount} />
      </div>
    </div>
  )
}
