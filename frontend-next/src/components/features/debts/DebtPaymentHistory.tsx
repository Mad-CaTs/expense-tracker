'use client'

import { useDebtPayments } from '@/lib/hooks/useDebts'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SHORT_DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })

interface DebtPaymentHistoryProps {
  debtId: number
  /** Lo que falta; cierra la lista con el saldo restante. */
  pending: number
  iOwe: boolean
}

/**
 * Abonos de una deuda pagada por partes.
 *
 * <p>"pagó S/50 de 80" dice cuánto, no CUÁNDO ni dónde entró. Con varios
 * abonos esa única línea deja de servir para reclamar.
 */
export function DebtPaymentHistory({ debtId, pending, iOwe }: DebtPaymentHistoryProps) {
  const { data: payments = [], isLoading } = useDebtPayments(debtId)

  if (isLoading) {
    return (
      <div className="mt-2 h-[46px] animate-pulse rounded-[12px]" style={{ background: 'var(--skeleton-from)' }} />
    )
  }
  if (payments.length === 0) return null

  return (
    <div className="mt-2 rounded-[12px] px-3 py-2" style={{ background: 'var(--bg-hover)' }}>
      {payments.map((p, i) => (
        <div
          key={p.id}
          className="flex items-center gap-3 py-[7px]"
          style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {SHORT_DATE.format(new Date(`${p.paidOn}T12:00:00`))}
            </span>
            {p.walletName && (
              <span className="mt-px block truncate text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                {p.walletName}
              </span>
            )}
          </span>
          <span className="mono-amount flex-none text-[12.5px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {iOwe ? '−' : '+'}S/ {money(p.amount)}
          </span>
        </div>
      ))}

      {pending > 0 && (
        <div
          className="mt-1 flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
            Falta
          </span>
          <span className="mono-amount text-[12.5px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            S/ {money(pending)}
          </span>
        </div>
      )}
    </div>
  )
}
