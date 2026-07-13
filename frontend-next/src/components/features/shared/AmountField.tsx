'use client'

import { motion } from 'framer-motion'

const MAX_AMOUNT = 999999.99

interface AmountFieldProps {
  label: string
  inputId: string
  value: string
  activeColor: string
  error?: string
  onChange: (value: string) => void
}

function formatDisplay(val: string): string {
  if (!val) return '0.00'
  const n = parseFloat(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function AmountField({ label, inputId, value, activeColor, error, onChange }: AmountFieldProps) {
  const amountNum = parseFloat(value) || 0

  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-1 flex items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        {error && (
          <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
      </div>
      <div className="relative" onClick={() => document.getElementById(inputId)?.focus()}>
        <input
          id={inputId}
          inputMode="decimal"
          type="number"
          min="0"
          max={MAX_AMOUNT}
          step="0.01"
          className="absolute inset-0 h-full w-full cursor-default opacity-0"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (v === '' || (/^\d*\.?\d{0,2}$/.test(v) && parseFloat(v) <= MAX_AMOUNT)) {
              onChange(v)
            }
          }}
        />
        <motion.p
          key={value}
          initial={{ scale: 0.95, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.08 }}
          className="mono-amount text-[52px] font-extrabold leading-none tracking-[-0.03em]"
          style={{ color: amountNum > 0 ? activeColor : 'var(--border-strong)' }}
        >
          S/ {formatDisplay(value)}
        </motion.p>
      </div>
    </div>
  )
}
