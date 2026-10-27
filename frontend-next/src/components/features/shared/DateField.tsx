'use client'

import { useEffect, useRef, useState } from 'react'

import { CalendarDays, ChevronDown } from 'lucide-react'

import { DateWheelPicker, wheelPickerHeight } from '@/components/ui/DateWheelPicker'
import { MOTION } from '@/lib/utils/motion'

const WHEEL_HEIGHT = wheelPickerHeight('sm')
const PANEL_GAP = 8
const PANEL_HEIGHT = WHEEL_HEIGHT + PANEL_GAP

interface DateFieldProps {
  value: string
  onChange: (date: string) => void
  label?: string
  /** Límites `YYYY-MM-DD`, inclusive. La rueda no puede deshabilitar días
   *  sueltos, así que una fecha fuera de rango vuelve al límite y se avisa. */
  min?: string
  max?: string
}

function toIso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function formatDateLabel(d: string) {
  const parts = d.split('-')
  if (parts.length !== 3) return d
  return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DateField({ value, onChange, label = 'Fecha', min, max }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [limitNote, setLimitNote] = useState('')
  /* Remontar la rueda es la forma de llevarla al límite: solo lee `value` al
     montarse, y después es ella la que manda. */
  const [wheelKey, setWheelKey] = useState(0)
  const unmountTimer = useRef<number | null>(null)
  const dateObj = new Date(value + 'T12:00:00')

  useEffect(() => () => {
    if (unmountTimer.current !== null) window.clearTimeout(unmountTimer.current)
  }, [])

  function toggle() {
    if (unmountTimer.current !== null) {
      window.clearTimeout(unmountTimer.current)
      unmountTimer.current = null
    }
    if (showPicker) {
      setShowPicker(false)
      unmountTimer.current = window.setTimeout(() => {
        setMounted(false)
        unmountTimer.current = null
      }, MOTION.layer)
      return
    }

    setMounted(true)
    requestAnimationFrame(() => setShowPicker(true))
  }

  function snapTo(bound: string, note: string) {
    setLimitNote(note)
    setWheelKey((k) => k + 1)
    onChange(bound)
  }

  function handlePick(d: Date) {
    const picked = toIso(d)
    if (min && picked < min) return snapTo(min, `No puede ser anterior al ${formatDateLabel(min)}`)
    if (max && picked > max) return snapTo(max, `No puede ser posterior al ${formatDateLabel(max)}`)
    setLimitNote('')
    onChange(picked)
  }

  return (
    <>
      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={showPicker}
        className="liquid-glass-ic flex h-[46px] w-full cursor-pointer items-center gap-2.5 rounded-[16px] px-[15px] text-left text-[14px] outline-none"
        style={{
          color: 'var(--text-primary)',
          ...(showPicker ? { borderColor: 'var(--accent-light)' } : {}),
        }}
      >
        <CalendarDays size={17} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
        <span className="flex-1">{formatDateLabel(value)}</span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transform: showPicker ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--dur-tint) var(--ease-sys)',
          }}
        />
      </button>

      {limitNote && (
        <p className="mt-1.5 px-1 text-[11px]" role="status" style={{ color: 'var(--text-tertiary)' }}>
          {limitNote}
        </p>
      )}

      {/* La rueda tiene alto FIJO y conocido, así que el contenedor anima hacia
          un número concreto en vez de hacia `auto` o `1fr`. `grid-template-rows`
          y `height:auto` son animaciones de layout: cada frame recalcula altura
          y reflowea el formulario entero, y con tres ruedas de scroll adentro
          eso no llega a 60fps en móvil.

          El panel además se desliza con `transform`, que corre en el compositor
          y no toca layout: es lo que da el movimiento suave. La altura sigue
          animándose para que la nota y los botones de abajo acompañen, pero
          `contain` mantiene ese recálculo dentro de este subárbol. */}
      <div
        className="overflow-hidden"
        style={{
          height: showPicker ? PANEL_HEIGHT : 0,
          transition: 'height var(--dur-layer) var(--ease-sys)',
          contain: 'layout paint style',
        }}
      >
        <div
          className="mt-2 overflow-hidden rounded-[16px]"
          style={{
            ['--bg-card-inner' as string]: 'var(--bg-elevated)',
            background: 'var(--bg-elevated)',
            transform: showPicker ? 'translate3d(0,0,0)' : `translate3d(0,-${WHEEL_HEIGHT}px,0)`,
            opacity: showPicker ? 1 : 0,
            transition: 'transform var(--dur-layer) var(--ease-sys), opacity var(--dur-tint) var(--ease-sys)',
          }}
        >
          {mounted && (
            <DateWheelPicker
              key={wheelKey}
              size="sm"
              value={dateObj}
              onChange={handlePick}
              minYear={min ? Number(min.slice(0, 4)) : undefined}
              maxYear={max ? Number(max.slice(0, 4)) : undefined}
            />
          )}
        </div>
      </div>

    </>
  )
}
