'use client'

import { motion } from 'framer-motion'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'

interface WalletSelectorProps {
  wallets?: Wallet[]
  selectedId: string
  error?: string
  onSelect: (walletId: string) => void
  /** Encabezado del campo: "Cuenta", "Desde", "Hacia"… */
  label?: string
  /** Cuenta que no se puede elegir acá (el origen, en una transferencia). */
  excludeId?: string
}

export function WalletSelector({ wallets, selectedId, error, onSelect, label = 'Cuenta', excludeId }: WalletSelectorProps) {
  if (!wallets || wallets.length === 0) return null

  return (
    <>
      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      {/* -mx-4 + px-4: las tarjetas sangran hasta el borde del sheet al
          scrollear, pero arrancan alineadas con el resto de los campos. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {wallets.map((w) => {
          const selected = selectedId === w.id.toString()
          const wColor = w.color ?? '#d4af37'
          const tint = categorySwatch(wColor)
          const disabled = excludeId != null && excludeId === w.id.toString()
          return (
            <motion.button
              key={w.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(w.id.toString())}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex shrink-0 flex-col items-start justify-between rounded-[15px] border px-3 py-2.5 text-left transition-colors ${disabled ? 'pointer-events-none opacity-35' : ''}`}
              style={selected
                ? { minWidth: '120px', background: `${wColor}18`, borderColor: tint }
                : { minWidth: '120px', background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)' }}
            >
              <span className="mb-[3px] max-w-full truncate text-[12px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {w.name}
              </span>
              <span className="mono-amount text-[11px] tabular-nums" style={{ color: tint }}>
                S/ {Number(w.balance).toFixed(2)}
              </span>
            </motion.button>
          )
        })}
      </div>
      {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
    </>
  )
}
