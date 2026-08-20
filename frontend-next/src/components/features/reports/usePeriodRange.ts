'use client'

import { useState } from 'react'

export type Granularity = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_FULL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function rangeOf(granularity: Granularity, date: Date): { from: string; to: string } {
  const y = date.getFullYear()

  if (granularity === 'YEARLY') {
    return { from: iso(new Date(y, 0, 1)), to: iso(new Date(y, 11, 31)) }
  }
  if (granularity === 'QUARTERLY') {
    const start = Math.floor(date.getMonth() / 3) * 3
    return { from: iso(new Date(y, start, 1)), to: iso(new Date(y, start + 3, 0)) }
  }
  return { from: iso(new Date(y, date.getMonth(), 1)), to: iso(new Date(y, date.getMonth() + 1, 0)) }
}

export function labelOf(granularity: Granularity, date: Date): string {
  if (granularity === 'YEARLY') return String(date.getFullYear())
  if (granularity === 'QUARTERLY') {
    const start = Math.floor(date.getMonth() / 3) * 3
    return `${MONTHS[start]} – ${MONTHS[start + 2]} ${date.getFullYear()}`
  }
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function longLabelOf(granularity: Granularity, date: Date): string {
  if (granularity === 'YEARLY') return String(date.getFullYear())
  if (granularity === 'QUARTERLY') {
    const start = Math.floor(date.getMonth() / 3) * 3
    return `${MONTHS_FULL[start]} – ${MONTHS_FULL[start + 2]} ${date.getFullYear()}`
  }
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`
}

function shift(granularity: Granularity, date: Date, delta: number): Date {
  const d = new Date(date)
  if (granularity === 'YEARLY') {
    d.setMonth(0, 1)
    d.setFullYear(d.getFullYear() + delta)
  } else if (granularity === 'QUARTERLY') {
    d.setDate(1)
    d.setMonth(d.getMonth() + delta * 3)
  } else {
    d.setDate(1)
    d.setMonth(d.getMonth() + delta)
  }
  return d
}

export interface PeriodInit {
  date?: Date
  custom?: { from: string; to: string } | null
}

export function usePeriodRange(initial: Granularity = 'MONTHLY', init?: PeriodInit) {
  const [granularity, setGran] = useState<Granularity>(initial)
  const [periodDate, setDate] = useState(() => init?.date ?? new Date())
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(() => init?.custom ?? null)

  const range = custom ?? rangeOf(granularity, periodDate)
  const today = rangeOf(granularity, new Date())

  function setGranularity(next: Granularity, date?: Date) {
    setGran(next)
    setDate(date ?? new Date())
    setCustom(null)
  }

  function setPeriodDate(delta: number) {
    setCustom(null)
    setDate((d) => shift(granularity, d, delta))
  }

  function setRange(from: string, to: string) {
    setCustom({ from, to })
  }

  function reset() {
    setGran(initial)
    setDate(new Date())
    setCustom(null)
  }

  function setPeriod(next: Granularity, date: Date) {
    setGran(next)
    setDate(date)
    setCustom(null)
  }

  return {
    granularity,
    setGranularity,
    periodDate,
    setPeriodDate,
    setRange,
    setPeriod,
    reset,
    range,
    isCustom: custom != null,
    label: custom ? customLabel(custom.from, custom.to) : labelOf(granularity, periodDate),
    longLabel: custom ? customLabel(custom.from, custom.to) : longLabelOf(granularity, periodDate),
    isCurrent: range.from === today.from && range.to === today.to,
  }
}

function customLabel(from: string, to: string): string {
  const a = new Date(`${from}T12:00:00`)
  const b = new Date(`${to}T12:00:00`)
  const day = (d: Date) => d.getDate()
  const month = (d: Date) => MONTHS[d.getMonth()].toLowerCase()
  if (from === to) return `${day(a)} ${month(a)}`
  if (a.getMonth() === b.getMonth()) return `${day(a)} – ${day(b)} ${month(b)}`
  return `${day(a)} ${month(a)} – ${day(b)} ${month(b)}`
}
