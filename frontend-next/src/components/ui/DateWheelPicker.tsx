'use client'

import { useEffect, useRef, useState } from 'react'

import { motion, useMotionValue, animate } from 'framer-motion'

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

/** Alto exacto de la rueda. Se exporta para que quien la despliegue pueda
 *  animar hacia una altura concreta en vez de hacia `auto`. */
export function wheelPickerHeight(size: keyof typeof ITEM_HEIGHT_MAP = 'md') {
  return ITEM_HEIGHT_MAP[size] * VISIBLE_ITEMS
}

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
  const selectedIndexRef = useRef(selectedIndex)
  const itemsLenRef = useRef(items.length)
  const onSelectIndexRef = useRef(onSelectIndex)

  useEffect(() => { selectedIndexRef.current = selectedIndex }, [selectedIndex])
  useEffect(() => { itemsLenRef.current = items.length }, [items.length])
  useEffect(() => { onSelectIndexRef.current = onSelectIndex }, [onSelectIndex])

  const visibleHeight = VISIBLE_ITEMS * itemHeight
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * itemHeight

  // El primer posicionamiento es instantáneo: al desplegarse el campo, tres
  // springs de framer arrancando en el mismo frame que la animación de apertura
  // eran gran parte del tirón. La rueda ya nace en su sitio y solo anima cuando
  // el usuario la mueve.
  const settled = useRef(false)
  useEffect(() => {
    const target = -selectedIndex * itemHeight
    if (!settled.current) {
      settled.current = true
      y.set(target)
      return
    }
    const controls = animate(y, target, { type: 'spring', stiffness: 300, damping: 30 })
    return () => controls.stop()
  }, [selectedIndex, itemHeight, y])

  // Register non-passive wheel listener so preventDefault actually stops page scroll
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (disabled) return
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY > 0 ? 1 : -1
      const next = clamp(selectedIndexRef.current + delta, 0, itemsLenRef.current - 1)
      onSelectIndexRef.current(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [disabled])

  function snapToIndex(rawY: number) {
    const idx = clamp(Math.round(-rawY / itemHeight), 0, items.length - 1)
    onSelectIndex(idx)
    animate(y, -idx * itemHeight, { type: 'spring', stiffness: 300, damping: 30 })
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
      style={{ height: visibleHeight, width: '100%', touchAction: 'none' }}
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
          background: 'linear-gradient(to bottom, var(--bg-card-inner) 0%, transparent 100%)',
        }}
      />

      {/* Selection band */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 rounded-lg border"
        style={{
          top: centerOffset,
          height: itemHeight,
          background: 'var(--accent-bg)',
          borderColor: 'var(--border-default)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: centerOffset,
          background: 'linear-gradient(to top, var(--bg-card-inner) 0%, transparent 100%)',
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
                    ? 'var(--text-primary)'
                    : distance === 1
                    ? 'var(--text-muted)'
                    : 'var(--border-strong)',
                // Solo color: animar `font-size` reflowea la columna entera en
                // cada frame, y son decenas de ítems por rueda.
                transition: 'color 0.15s',
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

  // El montaje NO notifica al padre: la fecha que muestra ya es la que el padre
  // tiene, así que ese onChange solo servía para re-renderizar el formulario a
  // mitad de la animación de apertura. Un flag por effect, y no uno compartido:
  // ambos corren en el primer ciclo y se pisarían el turno entre sí.
  const clampMounted = useRef(false)
  const dayMounted = useRef(false)

  // Clamp day when month/year changes. El timing de onChange es comportamiento observable:
  // clampear el día debe pasar por el effect de selectedDay para notificar al padre una sola vez.
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth)
    const clamped = clamp(selectedDay, 1, maxDay)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (clamped !== selectedDay) setSelectedDay(clamped)
    else if (clampMounted.current) onChange(new Date(selectedYear, selectedMonth - 1, clamped))
    clampMounted.current = true
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    if (!dayMounted.current) { dayMounted.current = true; return }
    onChange(new Date(selectedYear, selectedMonth - 1, selectedDay))
  }, [selectedDay])

  const yearIndex = years.indexOf(String(selectedYear))

  return (
    <div
      className="flex w-full gap-1 rounded-xl"
      style={{ background: 'var(--bg-card-inner)', touchAction: 'none' }}
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
