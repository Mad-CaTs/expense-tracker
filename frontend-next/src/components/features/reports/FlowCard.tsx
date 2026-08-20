'use client'

import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'

interface FlowCardProps {
  kind: 'expense' | 'income'
  total: number
  onClick: () => void
}

/**
 * Acceso a Estadísticas con su tipo ya elegido, y de paso el total del período.
 *
 * Sin comparación con el período anterior: los totales se derivan de los
 * movimientos de UNA billetera, y el endpoint que traía el período previo no
 * sabe acotar por billetera.
 */
export function FlowCard({ kind, total, onClick }: FlowCardProps) {
  const isExpense = kind === 'expense'
  const Icon = isExpense ? ArrowDown : ArrowUp
  const tint = isExpense ? 'var(--danger)' : 'var(--success)'

  return (
    <button
      type="button"
      onClick={onClick}
      className="liquid-glass flex-1 cursor-pointer rounded-[20px] p-[14px] text-left transition-transform active:scale-[0.985]"
    >
      <span className="flex items-center gap-[7px]">
        <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px]" style={{ background: isExpense ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)' }}>
          <Icon size={12} strokeWidth={2.4} style={{ color: tint }} />
        </span>
        <span className="text-[11.5px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          {isExpense ? 'Gastos' : 'Ingresos'}
        </span>
        <ChevronRight size={13} className="ml-auto flex-none" style={{ color: 'var(--text-muted)' }} />
      </span>

      <span className="mono-amount mt-[11px] block text-[21px] font-extrabold tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
        <small className="mr-1 text-[13px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</small>
        <AnimatedAmount value={total} fractionDigits={0} animateOnMount />
      </span>

    </button>
  )
}
