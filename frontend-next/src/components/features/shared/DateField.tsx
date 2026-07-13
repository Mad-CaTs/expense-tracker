'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

import { DateWheelPicker } from '@/components/ui/DateWheelPicker'

interface DateFieldProps {
  value: string
  onChange: (date: string) => void
}

function formatDateLabel(d: string) {
  const parts = d.split('-')
  if (parts.length !== 3) return d
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export function DateField({ value, onChange }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false)
  const dateObj = new Date(value + 'T12:00:00')

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <div className="mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Fecha
        </p>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
        >
          <CalendarDays size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono">{formatDateLabel(value)}</span>
        </button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 top-1/2 z-50 mx-4 -translate-y-1/2 rounded-[20px] border p-[1px]"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
            >
              <div
                className="rounded-[19px] px-4 pb-5 pt-4"
                style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Fecha</p>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="rounded-full px-4 py-1.5 text-[12px] font-semibold cursor-pointer"
                    style={{ background: 'var(--bg-hover)', color: 'var(--accent-light)' }}
                  >
                    Listo
                  </button>
                </div>
                <DateWheelPicker
                  value={dateObj}
                  onChange={(d) => {
                    const y = d.getFullYear()
                    const m = String(d.getMonth() + 1).padStart(2, '0')
                    const day = String(d.getDate()).padStart(2, '0')
                    onChange(`${y}-${m}-${day}`)
                  }}
                  size="md"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
