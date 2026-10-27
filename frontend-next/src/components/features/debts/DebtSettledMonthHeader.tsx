'use client'

import { longLabelOf } from '@/components/features/reports/usePeriodRange'

import type { SettledMonth } from './settledGroups'
import { useDebtSymbols } from './useDebtSymbols'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface DebtSettledMonthHeaderProps {
  month: SettledMonth
  /** Posición en la lista: alimenta el stagger de `enter-pop`. */
  index: number
}

/**
 * Encabezado de un mes de deudas saldadas: cuántas fueron y cuánto sumaron.
 *
 * Es lo que hace visible el orden de la lista, y de paso responde cuánto
 * volvió a la billetera cada mes.
 */
export function DebtSettledMonthHeader({ month, index }: DebtSettledMonthHeaderProps) {
  const { sharedSym } = useDebtSymbols()
  const sym = sharedSym(month.debts)
  const count = month.debts.length
  const total = month.debts.reduce((acc, d) => acc + d.amount, 0)

  return (
    <div
      className="enter-pop flex items-baseline gap-2 px-[18px] pb-[7px] pt-2.5"
      style={{ ['--enter-i' as string]: index }}
    >
      <span className="text-[12.5px] font-extrabold tracking-[-0.01em] first-letter:uppercase" style={{ color: 'var(--text-primary)' }}>
        {longLabelOf('MONTHLY', new Date(`${month.key}-01T12:00:00`))}
      </span>
      <span className="flex-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {count} {count === 1 ? 'deuda' : 'deudas'}
      </span>
      <span className="amount-figure text-[11.5px] font-bold tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
        {sym && `${sym} `}{money(total)}
      </span>
    </div>
  )
}
