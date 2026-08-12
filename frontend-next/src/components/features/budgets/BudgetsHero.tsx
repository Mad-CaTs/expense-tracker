'use client'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import type { Budget } from '@/types'

/** A partir de este consumo un presupuesto se considera "cerca del límite". */
export const NEAR_LIMIT_PCT = 80

/**
 * Metadato del hero. Todos van en blanco: el estado de cada presupuesto se lee
 * en su tarjeta, no acá — teñir estas cifras convertía el resumen en un
 * semáforo que competía con el grid.
 */
function Metric({ label, value, count, suffix }: { label: string; value?: string; count?: number; suffix?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      <p className="mt-[3px] truncate text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {count != null ? <><AnimatedAmount value={count} fractionDigits={0} animateOnMount />{suffix}</> : value}
      </p>
    </div>
  )
}

/**
 * Cabecera de /budgets.
 *
 * A diferencia del resto de pantallas, el número grande NO es dinero ya gastado
 * sino el límite que te propusiste: es el dato que define este módulo. Lo
 * consumido queda como porcentaje en los metadatos.
 */
export function BudgetsHero({ budgets }: { budgets: Budget[] }) {
  const limit = budgets.reduce((sum, b) => sum + (b.amount ?? 0), 0)
  const spent = budgets.reduce((sum, b) => sum + (b.spent ?? 0), 0)
  const consumed = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const exceeded = budgets.filter((b) => (b.percentage ?? 0) > 100).length

  return (
    <div className="liquid-glass mx-4 mb-3.5 rounded-[22px] p-[18px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-placeholder)' }}>
        Presupuestado este mes
      </p>
      {/* Recorre hasta su nuevo valor: al crear o editar un presupuesto, un
          salto de cifra se lee como parpadeo y no se ve si subió o bajó. */}
      <p className="mono-amount mt-[7px] text-[31px] font-extrabold leading-[1.05] tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
        <small className="mr-[5px] text-[18px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</small>
        <AnimatedAmount value={limit} animateOnMount />
      </p>
      <div className="mt-3.5 flex gap-4 border-t pt-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <Metric label="Consumido" count={consumed} suffix="%" />
        <Metric label="Todos" count={budgets.length} />
        <Metric label="Excedidos" count={exceeded} />
      </div>
    </div>
  )
}
