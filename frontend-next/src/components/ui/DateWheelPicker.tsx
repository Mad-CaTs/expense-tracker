'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface DateWheelPickerProps {
  value: Date
  onChange: (date: Date) => void
  size?: 'sm' | 'md' | 'lg'
  minYear?: number
  maxYear?: number
  disabled?: boolean
  locale?: string
}

const ITEM_HEIGHT_MAP = { sm: 36, md: 44, lg: 52 }
const VISIBLE_ITEMS = 5

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

interface WheelColumnProps {
  items: string[]
  selectedIndex: number
  onSelectIndex: (i: number) => void
  itemHeight: number
  disabled?: boolean
}

function WheelColumn({ items, selectedIndex, onSelectIndex, itemHeight, disabled }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(-selectedIndex * itemHeight)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startIndex = useRef(selectedIndex)

  const visibleHeight = VISIBLE_ITEMS * itemHeight
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * itemHeight

  useEffect(() => {
    animate(y, -selectedIndex * itemHeight, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  }, [selectedIndex, itemHeight, y])

  function snapToIndex(rawY: number) {
    const idx = clamp(Math.round(-rawY / itemHeight), 0, items.length - 1)
    onSelectIndex(idx)
    animate(y, -idx * itemHeight, { type: 'spring', stiffness: 300, damping: 30 })
  }

  function handleWheel(e: React.WheelEvent) {
    if (disabled) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const next = clamp(selectedIndex + delta, 0, items.length - 1)
    onSelectIndex(next)
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (disabled) return
    isDragging.current = true
    startY.current = e.clientY
    startIndex.current = selectedIndex
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current || disabled) return
    const delta = e.clientY - startY.current
    y.set(-startIndex.current * itemHeight + delta)
  }

  function handlePointerUp() {
    if (!isDragging.current || disabled) return
    isDragging.current = false
    snapToIndex(y.get())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      onSelectIndex(clamp(selectedIndex - 1, 0, items.length - 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onSelectIndex(clamp(selectedIndex + 1, 0, items.length - 1))
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden focus:outline-none"
      style={{ height: visibleHeight, width: '100%' }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="listbox"
      aria-label="wheel picker"
    >
      {/* Top fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: centerOffset,
          background: 'linear-gradient(to bottom, #0e0e0e 0%, transparent 100%)',
        }}
      />

      {/* Selection band */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 rounded-lg border border-[#2a2a2a]"
        style={{
          top: centerOffset,
          height: itemHeight,
          background: 'rgba(212,175,55,0.06)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: centerOffset,
          background: 'linear-gradient(to top, #0e0e0e 0%, transparent 100%)',
        }}
      />

      {/* Items */}
      <motion.div style={{ y, paddingTop: centerOffset }}>
        {items.map((label, i) => {
          const distance = Math.abs(i - selectedIndex)
          return (
            <div
              key={i}
              onClick={() => !disabled && onSelectIndex(i)}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: distance === 0 ? 15 : 13,
                fontWeight: distance === 0 ? 600 : 400,
                color:
                  distance === 0
                    ? '#e8e6db'
                    : distance === 1
                    ? '#505050'
                    : '#2e2e2e',
                transition: 'color 0.15s, font-size 0.15s',
              }}
            >
              {label}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function DateWheelPicker({
  value,
  onChange,
  size = 'md',
  minYear,
  maxYear,
  disabled = false,
  locale = 'es-PE',
}: DateWheelPickerProps) {
  const itemHeight = ITEM_HEIGHT_MAP[size]
  const currentYear = new Date().getFullYear()
  const minY = minYear ?? currentYear - 5
  const maxY = maxYear ?? currentYear + 2

  const years = Array.from({ length: maxY - minY + 1 }, (_, i) => String(minY + i))

  const [selectedYear, setSelectedYear] = useState(value.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth() + 1) // 1-based
  const [selectedDay, setSelectedDay] = useState(value.getDate())

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))

  // Clamp day when month/year changes
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth)
    const clamped = clamp(selectedDay, 1, maxDay)
    if (clamped !== selectedDay) setSelectedDay(clamped)
    else onChange(new Date(selectedYear, selectedMonth - 1, clamped))
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    onChange(new Date(selectedYear, selectedMonth - 1, selectedDay))
  }, [selectedDay])

  const yearIndex = years.indexOf(String(selectedYear))

  return (
    <div
      className="flex w-full gap-1 rounded-xl bg-[#0e0e0e]"
      style={{ touchAction: 'none' }}
    >
      {/* Day */}
      <div className="flex-1">
        <WheelColumn
          items={days}
          selectedIndex={selectedDay - 1}
          onSelectIndex={(i) => setSelectedDay(i + 1)}
          itemHeight={itemHeight}
          disabled={disabled}
        />
      </div>

      {/* Month */}
      <div className="flex-[2]">
        <WheelColumn
          items={MONTHS_ES}
          selectedIndex={selectedMonth - 1}
          onSelectIndex={(i) => setSelectedMonth(i + 1)}
          itemHeight={itemHeight}
          disabled={disabled}
        />
      </div>

      {/* Year */}
      <div className="flex-1">
        <WheelColumn
          items={years}
          selectedIndex={yearIndex >= 0 ? yearIndex : 0}
          onSelectIndex={(i) => setSelectedYear(Number(years[i]))}
          itemHeight={itemHeight}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
