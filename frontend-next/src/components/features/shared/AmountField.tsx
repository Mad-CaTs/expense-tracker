'use client'

import { motion } from 'framer-motion'

const MAX_AMOUNT = 999999.99

interface AmountFieldProps {
  label: string
  inputId: string
  value: string
  error?: string
  onChange: (value: string) => void
}

function formatDisplay(val: string): string {
  if (!val) return '0.00'
  const n = parseFloat(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function AmountField({ label, inputId, value, error, onChange }: AmountFieldProps) {
  const amountNum = parseFloat(value) || 0

  return (
    <div
      className="liquid-glass-ic flex flex-col items-center rounded-[20px] px-4 py-[18px]"
      style={error ? { borderColor: 'var(--danger)' } : undefined}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      <div className="relative" onClick={() => document.getElementById(inputId)?.focus()}>
        <input
          id={inputId}
          inputMode="decimal"
          type="number"
          min="0"
          max={MAX_AMOUNT}
          step="0.01"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
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
          className="mono-amount text-[40px] font-extrabold leading-none tracking-[-0.03em]"
          style={{ color: amountNum > 0 ? 'var(--accent-light)' : 'var(--text-placeholder)' }}
        >
          S/ {formatDisplay(value)}
        </motion.p>
      </div>
      {error && <p className="mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
