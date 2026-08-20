'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Granularity } from '@/components/features/reports/usePeriodRange'

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const QUARTERS = ['Ene – Mar', 'Abr – Jun', 'Jul – Sep', 'Oct – Dic']

const YEARS_BACK = 11

interface PeriodPickerProps {
  granularity: Granularity
  value: Date
  onSelect: (date: Date) => void
}

export function PeriodPicker({ granularity, value, onSelect }: PeriodPickerProps) {
  const [year, setYear] = useState(value.getFullYear())

  const currentYear = new Date().getFullYear()
  const activeYear = value.getFullYear()
  const activeMonth = value.getMonth()

  if (granularity === 'YEARLY') {
    const years = Array.from({ length: YEARS_BACK }, (_, i) => currentYear - i)
    return (
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => (
          <Cell key={y} label={String(y)} on={y === activeYear} onClick={() => onSelect(new Date(y, 0, 1))} />
        ))}
      </div>
    )
  }

  const isQuarterly = granularity === 'QUARTERLY'
  const items = isQuarterly ? QUARTERS : MONTHS_SHORT
  const activeIndex = isQuarterly ? Math.floor(activeMonth / 3) : activeMonth

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <motion.button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Año anterior"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={15} />
        </motion.button>

        <span className="text-[13px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {year}
        </span>

        <motion.button
          type="button"
          onClick={() => year < currentYear && setYear((y) => y + 1)}
          disabled={year >= currentYear}
          whileTap={year >= currentYear ? undefined : { scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Año siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            color: year >= currentYear ? 'var(--border-strong)' : 'var(--text-muted)',
            cursor: year >= currentYear ? 'default' : 'pointer',
          }}
        >
          <ChevronRight size={15} />
        </motion.button>
      </div>

      <div className={`grid gap-2 ${isQuarterly ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {items.map((label, i) => {
          const month = isQuarterly ? i * 3 : i
          const ahead = year > currentYear || (year === currentYear && month > new Date().getMonth())
          return (
            <Cell
              key={label}
              label={label}
              on={year === activeYear && i === activeIndex}
              disabled={ahead}
              onClick={() => onSelect(new Date(year, month, 1))}
            />
          )
        })}
      </div>
    </div>
  )
}

function Cell({ label, on, disabled = false, onClick }: {
  label: string
  on: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex h-10 items-center justify-center rounded-[12px] border text-[12.5px] font-bold${on || disabled ? '' : ' liquid-glass-ic'}`}
      style={on
        ? { background: 'var(--accent-light)', borderColor: 'var(--accent-light)', color: 'var(--bg-base)', cursor: 'pointer' }
        : {
            borderColor: 'transparent',
            color: disabled ? 'var(--text-placeholder)' : 'var(--text-secondary)',
            cursor: disabled ? 'default' : 'pointer',
          }}
    >
      {label}
    </motion.button>
  )
}
