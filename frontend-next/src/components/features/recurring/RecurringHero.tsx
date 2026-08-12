'use client'

import { motion } from 'framer-motion'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { RecurringExpense } from '@/types'

/** Cuántas veces al mes ocurre cada frecuencia: 52 semanas / 12 meses = 4.33. */
const PER_MONTH: Record<string, number> = { WEEKLY: 52 / 12, MONTHLY: 1, YEARLY: 1 / 12 }

/**
 * Metadato del hero. Con `count`, el número recorre hasta su nuevo valor; con
 * `value` (una fecha, que no se puede interpolar) el texto hace un fundido
 * corto para que el cambio no pase desapercibido.
 */
function Metric({ label, value, count }: { label: string; value?: string; count?: number }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
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

/** Fecha corta: "25 jul." */
function shortDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

/**
 * Cuánto comprometen los recurrentes al mes.
 *
 * Las frecuencias se normalizan (semanal ×4.33, anual ÷12) para que el total
 * sea comparable: sumar los montos crudos mezclaría un gasto semanal con uno
 * anual. Los pausados no cuentan — no van a ejecutarse.
 */
export function RecurringHero({ items }: { items: RecurringExpense[] }) {
  const active = items.filter((r) => r.active)
  const paused = items.length - active.length

  const monthly = active.reduce((sum, r) => sum + (r.amount ?? 0) * (PER_MONTH[r.frequency] ?? 1), 0)

  const next = active
    .filter((r) => r.nextDate)
    .map((r) => r.nextDate)
    .sort((a, b) => a.localeCompare(b))[0]

  return (
    <div className="liquid-glass mx-4 mb-3.5 rounded-[22px] p-[18px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>
        Comprometido al mes
      </p>
      {/* El total recorre hasta su nuevo valor: al pausar un frecuente o crear
          otro, un salto de cifra se lee como parpadeo y no se ve si subió. */}
      <p className="mono-amount mt-[7px] text-[31px] font-extrabold leading-[1.05] tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
        <small className="mr-[5px] text-[18px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</small>
        <AnimatedAmount value={monthly} animateOnMount />
      </p>
      <div className="mt-3.5 flex gap-4 border-t pt-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <Metric label="Activos" count={active.length} />
        <Metric label="Pausados" count={paused} />
        <Metric label="Próximo" value={next ? shortDate(next) : '—'} />
      </div>
    </div>
  )
}
