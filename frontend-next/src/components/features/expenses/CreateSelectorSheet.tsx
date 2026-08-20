'use client'

import { motion } from 'framer-motion'
import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react'

import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { ActiveSheet } from '@/stores/sheetStore'

interface CreateSelectorSheetProps {
  onSelect: (sheet: ActiveSheet) => void
}

const OPTIONS: { label: string; desc: string; Icon: typeof TrendingDown; sheet: ActiveSheet; color: string }[] = [
  { label: 'Gasto', desc: 'Registrar un egreso', Icon: TrendingDown, sheet: { kind: 'expense-form' }, color: 'var(--text-primary)' },
  { label: 'Ingreso', desc: 'Registrar un ingreso', Icon: TrendingUp, sheet: { kind: 'income-form' }, color: 'var(--success)' },
  { label: 'Transferir', desc: 'Mover entre cuentas', Icon: ArrowLeftRight, sheet: { kind: 'transfer' }, color: 'var(--accent-light)' },
]

export function CreateSelectorSheet({ onSelect }: CreateSelectorSheetProps) {
  return (
    <div className="flex flex-col gap-2 px-4 pb-6 pt-2">
      {OPTIONS.map((opt) => (
        <motion.button
          key={opt.label}
          type="button"
          onClick={() => onSelect(opt.sheet)}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: MOTION_S.press, ease: EASE }}
          className="flex items-center gap-3 rounded-[var(--r-md)] px-4 py-3.5 text-left transition-colors cursor-pointer"
          style={{ background: 'var(--surface-raised)' }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--r-sm)]" style={{ background: 'var(--bg-hover)' }}>
            <opt.Icon size={18} style={{ color: opt.color }} strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="t-body font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
            <p className="t-caption" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
