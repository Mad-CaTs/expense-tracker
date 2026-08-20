'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

interface RangeCalendarProps {
  from: string
  to: string
  onSelect: (from: string, to: string) => void
}

type PickMode = 'day' | 'range'

interface Cell {
  date: Date
  inMonth: boolean
}

/** Seis semanas desde el lunes previo al día 1: rejilla de alto constante. */
function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7))

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return { date, inMonth: date.getMonth() === month }
  })
}

export function RangeCalendar({ from, to, onSelect }: RangeCalendarProps) {
  const anchor = new Date(`${from}T12:00:00`)
  const [view, setView] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
  const [pendingStart, setPendingStart] = useState<string | null>(null)
  const [mode, setMode] = useState<PickMode>(from === to ? 'day' : 'range')

  const cells = buildGrid(view.getFullYear(), view.getMonth())
  const today = iso(new Date())

  const start = pendingStart ?? from
  const end = pendingStart ?? to

  function handlePick(date: Date) {
    const picked = iso(date)

    if (mode === 'day') {
      setPendingStart(null)
      onSelect(picked, picked)
      return
    }

    if (!pendingStart) {
      setPendingStart(picked)
      return
    }
    setPendingStart(null)
    if (picked < pendingStart) onSelect(picked, pendingStart)
    else onSelect(pendingStart, picked)
  }

  function switchMode(next: PickMode) {
    setPendingStart(null)
    setMode(next)
  }

  function shiftMonth(delta: number) {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1))
  }

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {([['day', 'Un día'], ['range', 'Rango']] as const).map(([key, text]) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`h-9 flex-1 cursor-pointer rounded-[12px] border text-[12px] font-bold${mode === key ? '' : ' liquid-glass-ic'}`}
            style={mode === key
              ? { background: 'var(--accent-light)', borderColor: 'var(--accent-light)', color: 'var(--bg-base)' }
              : { borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
          >
            {text}
          </motion.button>
        ))}
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <motion.button
          type="button"
          onClick={() => shiftMonth(-1)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Mes anterior"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={15} />
        </motion.button>

        <span className="text-[13px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>

        <motion.button
          type="button"
          onClick={() => shiftMonth(1)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronRight size={15} />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-center text-[10px] font-bold" style={{ color: 'var(--text-placeholder)' }}>
            {d}
          </span>
        ))}

        {cells.map(({ date, inMonth }, i) => {
          const key = iso(date)
          const isStart = key === start
          const isEnd = key === end
          const inRange = key > start && key < end
          const isToday = key === today

          return (
            <button
              key={i}
              type="button"
              disabled={!inMonth}
              onClick={() => handlePick(date)}
              className="relative flex h-9 items-center justify-center text-[12.5px] font-bold disabled:cursor-default"
              style={{ cursor: inMonth ? 'pointer' : 'default' }}
            >
              {/* Continuidad del rango: el fondo se extiende hasta el borde de
                  la celda para que los días intermedios formen una banda. */}
              {(inRange || isStart || isEnd) && inMonth && (
                <span
                  aria-hidden
                  className="absolute inset-y-[3px]"
                  style={{
                    background: 'var(--accent-bg)',
                    left: isStart ? '50%' : 0,
                    right: isEnd ? '50%' : 0,
                    display: isStart && isEnd ? 'none' : undefined,
                  }}
                />
              )}

              <span
                className="relative flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: isStart || isEnd ? 'var(--accent-light)' : 'transparent',
                  color: !inMonth
                    ? 'var(--text-placeholder)'
                    : isStart || isEnd
                      ? 'var(--bg-base)'
                      : 'var(--text-primary)',
                  boxShadow: isToday && !isStart && !isEnd ? 'inset 0 0 0 1px var(--border-strong)' : 'none',
                  transition: 'background-color var(--dur-tint) var(--ease-sys)',
                }}
              >
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-center text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>
        {mode === 'day'
          ? 'Toca el día que quieres ver'
          : pendingStart
            ? 'Elige el día final'
            : 'Toca dos días para acotar el rango'}
      </p>
    </div>
  )
}
