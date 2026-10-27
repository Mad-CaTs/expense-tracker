'use client'

import { Landmark } from 'lucide-react'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { useWalletCurrency } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'

interface ClosingBalanceCardProps {
  balance: number
  /** Período que cerró, en largo ("septiembre 2026"). */
  period: string
}

/**
 * Con cuánto cerró la billetera el período que se está mirando.
 *
 * Ocupa su propia fila, a diferencia de Gastos e Ingresos: un saldo acumulado
 * tiene más dígitos que el flujo de un mes y a un tercio del ancho se
 * recortaba. Va debajo de esas dos porque completa la misma frase —cuánto
 * salió, cuánto entró, con cuánto quedaste.
 *
 * Es `div` y no `button`: las otras dos llevan a Estadísticas y este dato no
 * tiene detalle al que ir —un chevron prometería una pantalla que no existe.
 *
 * Solo se monta en períodos ya cerrados (ver `isCurrent` en ReportsScreen).
 */
export function ClosingBalanceCard({ balance, period }: ClosingBalanceCardProps) {
  const sym = symbolOf(useWalletCurrency())

  return (
    <div className="liquid-glass flex items-center gap-3 rounded-[20px] p-[14px]">
      <span
        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[11px]"
        style={{ background: 'var(--bg-hover)' }}
      >
        <Landmark size={16} strokeWidth={2.2} style={{ color: 'var(--text-secondary)' }} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block text-[10px] font-extrabold uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Cierre de {period}
        </span>
        <span
          className="amount-figure mt-[3px] block truncate text-[21px] font-extrabold tracking-[-0.03em] tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          <small className="amount-figure mr-1 text-[13px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
            {sym}
          </small>
          <AnimatedAmount value={balance} animateOnMount />
        </span>
      </span>
    </div>
  )
}
