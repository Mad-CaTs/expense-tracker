import type { CSSProperties } from 'react'

type Kind = 'expense' | 'income' | 'neutral'

interface MoneyTextProps {
  amount: number
  kind?: Kind
  className?: string
  style?: CSSProperties
  /** Oculta la cifra con bullets (modo privacidad). */
  hidden?: boolean
}

function formatAmount(n: number): string {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Monto financiero con color semántico:
 * - expense: color de texto normal, prefijo '-'
 * - income:  verde, prefijo '+'
 * - neutral: color de texto normal, sin signo
 */
export function MoneyText({ amount, kind = 'neutral', className = '', style, hidden = false }: MoneyTextProps) {
  const color = kind === 'income' ? 'var(--success)' : 'var(--text-primary)'
  const sign = kind === 'income' ? '+' : kind === 'expense' ? '-' : ''
  const abs = Math.abs(amount)

  return (
    <span className={`mono-amount ${className}`} style={{ color, ...style }}>
      {hidden ? 'S/ ••••••' : `${sign}S/ ${formatAmount(abs)}`}
    </span>
  )
}
