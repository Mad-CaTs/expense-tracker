'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'framer-motion'

import { EASE, MOTION_S } from '@/lib/utils/motion'

/* ── Conversiones de color ───────────────────────────────────────────────────
 * No hay librería de color en el proyecto y no vale la pena añadir una por tres
 * funciones. Todas trabajan con RGB 0-255, H 0-360 y S/V 0-1.
 */

export interface Rgb { r: number; g: number; b: number }
export interface Hsv { h: number; s: number; v: number }

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/** `#abc` y `#aabbcc`, con o sin `#`. Devuelve null si no es hex válido, que es
 *  lo que usa el campo de texto para decidir si marcarlo como error. */
export function parseHex(input: string): Rgb | null {
  const c = input.trim().replace(/^#/, '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) return null
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const hex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
    else if (max === gn) h = ((bn - rn) / d + 2) * 60
    else h = ((rn - gn) / d + 4) * 60
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hn = ((h % 360) + 360) % 360
  const c = v * s
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = v - c

  // El sector de 60° decide qué canal es máximo, cuál intermedio y cuál mínimo.
  const sector = Math.floor(hn / 60) % 6
  const table: [number, number, number][] = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ]
  const [r, g, b] = table[sector]
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

/* ── Paleta de la cuadrícula ─────────────────────────────────────────────────
 * Se genera en vez de escribirse a mano: 12 matices × 5 luminosidades cubre el
 * círculo de forma pareja, y una lista literal de 60 hex sería imposible de
 * mantener coherente. La fila de grises va aparte porque con S=0 los 12 matices
 * colapsarían en el mismo color repetido.
 */
const GRID_HUES = 12
const GRID_STEPS: { s: number; v: number }[] = [
  { s: 0.28, v: 1.00 },
  { s: 0.55, v: 0.98 },
  { s: 0.85, v: 0.92 },
  { s: 0.95, v: 0.70 },
  { s: 0.95, v: 0.45 },
]

function buildGrid(): string[] {
  const rows = GRID_STEPS.flatMap(({ s, v }) =>
    Array.from({ length: GRID_HUES }, (_, i) => rgbToHex(hsvToRgb({ h: (360 / GRID_HUES) * i, s, v }))),
  )
  const greys = Array.from({ length: GRID_HUES }, (_, i) => {
    const level = i / (GRID_HUES - 1)
    const channel = level * 255
    return rgbToHex({ r: channel, g: channel, b: channel })
  })
  return [...rows, ...greys]
}

const GRID_COLORS = buildGrid()

/** Fallback cuando el `value` del padre no parsea. */
const BLACK: Rgb = { r: 0, g: 0, b: 0 }

type Tab = 'grid' | 'spectrum' | 'sliders'

const TABS: { id: Tab; label: string }[] = [
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'spectrum', label: 'Espectro' },
  { id: 'sliders', label: 'Deslizadores' },
]

export interface ColorPickerSheetProps {
  value: string
  onChange: (hex: string) => void
  onClose: () => void
  title?: string
}

/**
 * Picker de color libre, al estilo del `UIColorPickerViewController` de iOS:
 * tres vistas del mismo color (cuadrícula, espectro y deslizadores) que se
 * alternan con un segmented control.
 *
 * NO usa `ui/Sheet` ni el `sheetStore` a propósito:
 *
 * - El `sheetStore` tiene UNA sola ranura (`active`), así que abrir el picker
 *   por ahí reemplazaría el sheet del formulario desde el que se abre y se
 *   perdería lo escrito.
 * - `ui/Sheet` arrastra para cerrarse con los mismos eventos de puntero que el
 *   espectro necesita para seleccionar, y anidarlo apilaría dos backdrops y dos
 *   `contain: layout paint style`.
 *
 * Por eso monta su propia capa por encima (z-60) y se controla montándolo o
 * desmontándolo, igual que el resto de sheets de la app. Sin lógica de dominio:
 * sirve para billeteras, categorías o presupuestos.
 */
export function ColorPickerSheet({ value, onChange, onClose, title = 'Color' }: ColorPickerSheetProps) {
  const [tab, setTab] = useState<Tab>('grid')

  // El hex que se está TECLEANDO, que puede ser inválido a medio escribir
  // ("#3b8"). El color real solo se propaga cuando parsea; hasta entonces el
  // campo se pinta en rojo y no se toca al padre.
  const [draft, setDraft] = useState(value)
  const draftValid = parseHex(draft) !== null

  // El padre es la fuente de verdad, pero mientras el campo está enfocado no se
  // pisa lo que el usuario escribe: sin el flag, teclear "#3b8" se revertía al
  // color anterior en el mismo keystroke.
  const editing = useRef(false)
  useEffect(() => {
    if (!editing.current) setDraft(value)
  }, [value])

  const rgb = parseHex(value) ?? BLACK

  // El HSV es estado PROPIO, no derivado del hex en cada render.
  //
  // HSV→RGB no es inyectivo: con s=0 o v=0 el matiz no cabe en el hex y volver
  // a leerlo lo devuelve como h=0. Derivándolo, bajar la saturación de un azul
  // (#3b82f6, h=217) guardaba #f6f6f6 y al volver a subirla salía ROJO; y
  // arrastrar el espectro hasta el borde inferior (v=0) teletransportaba el
  // knob a la esquina izquierda con el dedo todavía a la derecha.
  //
  // Manteniéndolo aparte, h y s sobreviven a los extremos — igual que en el
  // picker de iOS que replica.
  const [hsv, setHsv] = useState<Hsv>(() => rgbToHsv(parseHex(value) ?? BLACK))

  // Lo último que emitió el picker. Un `value` distinto viene de FUERA (el
  // padre reseteó el color) y sí debe re-derivar el HSV; el eco de nuestro
  // propio onChange no, porque perdería el matiz que acabamos de preservar.
  const lastEmitted = useRef(value)
  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    setHsv(rgbToHsv(parseHex(value) ?? BLACK))
  }, [value])

  /** Emite un color desde RGB (sliders, cuadrícula, campo hex). */
  const commit = useCallback((next: Rgb) => {
    const hex = rgbToHex(next)
    lastEmitted.current = hex
    setHsv(rgbToHsv(next))
    setDraft(hex)
    onChange(hex)
  }, [onChange])

  /** Emite desde HSV (espectro y slider de saturación), conservando el matiz
   *  aunque el hex resultante ya no lo represente. */
  const commitHsv = useCallback((next: Hsv) => {
    const hex = rgbToHex(hsvToRgb(next))
    lastEmitted.current = hex
    setHsv(next)
    setDraft(hex)
    onChange(hex)
  }, [onChange])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // El foco entra al panel y vuelve de donde vino. Sin esto, al abrir el picker
  // el foco se queda en el botón que lo lanzó — detrás del backdrop — y tabular
  // recorre el formulario oculto.
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const restoreTo = document.activeElement as HTMLElement | null
    panel.current?.focus()
    return () => restoreTo?.focus?.()
  }, [])

  /*
   * Al `<body>` por portal, como AttachmentsModal.
   *
   * `position: fixed` se resuelve contra el viewport SALVO que un ancestro
   * tenga `transform`, que entonces pasa a ser su bloque contenedor. El
   * onboarding desplaza sus slides con `translate3d`, así que dentro del árbol
   * de la página el sheet se anclaba al slide y aparecía fuera de pantalla
   * (x = -1648) en vez de sobre el viewport.
   */
  return createPortal(
    /* z-[60]: por encima del z-50 de los sheets, para poder abrirse desde un
       formulario que ya vive dentro de uno. */
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION_S.layer }}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />

      <motion.div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: MOTION_S.sheet, ease: EASE }}
        className="liquid-glass relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border-b-0 outline-none"
        style={{
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <p className="px-4 pb-1 pt-2 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>

        {/* `overscroll-contain`: en iOS Safari el scroll del panel encadena al
            documento de detrás al llegar al tope. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <SegmentedTabs active={tab} onChange={setTab} />

          <div className="pt-4">
            {tab === 'grid' && <GridView value={value} onPick={(hex) => commit(parseHex(hex) ?? BLACK)} />}
            {tab === 'spectrum' && <SpectrumView hsv={hsv} onPick={commitHsv} />}
            {tab === 'sliders' && <SlidersView rgb={rgb} onPick={commit} />}
          </div>

          {/* Muestra + hex, siempre visibles: son el denominador común de las
              tres vistas, y dejan claro qué color hay elegido sin importar
              cuál esté abierta. */}
          <div className="mt-5 flex items-center gap-2.5">
            <span
              className="h-10 w-10 flex-none rounded-full"
              style={{ background: value, boxShadow: '0 0 0 1px var(--lg-ic-border)' }}
              aria-hidden
            />
            <input
              type="text"
              value={draft}
              onFocus={() => { editing.current = true }}
              onBlur={() => {
                editing.current = false
                setDraft(value) // Descarta un hex a medio escribir al salir.
              }}
              onChange={(e) => {
                const next = e.target.value
                const parsed = parseHex(next)
                // `commit` reescribiría el campo a la forma canónica de 6
                // dígitos en mitad de la escritura, así que el draft se
                // mantiene tal cual se teclea y solo se propaga el color.
                if (parsed) commit(parsed)
                setDraft(next)
              }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Código hexadecimal del color"
              aria-invalid={!draftValid}
              className="mono-amount h-10 min-w-0 flex-1 rounded-[12px] bg-transparent px-3 text-[13px] font-bold uppercase outline-none"
              style={{
                color: draftValid ? 'var(--text-primary)' : 'var(--danger)',
                boxShadow: `0 0 0 1px ${draftValid ? 'var(--lg-ic-border)' : 'var(--danger)'}`,
              }}
            />
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-10 flex-none cursor-pointer rounded-full px-5 text-[13px] font-bold"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              Listo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

function SegmentedTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="liquid-glass flex gap-1.5 rounded-full p-[5px]">
      {TABS.map(({ id, label }) => {
        const on = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={on}
            className="flex-1 cursor-pointer rounded-full py-2 text-[12.5px] font-bold transition-colors"
            style={on
              ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
              : { color: 'var(--text-muted)' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function GridView({ value, onPick }: { value: string; onPick: (hex: string) => void }) {
  // Normalizado, no `toLowerCase()`: el padre puede entregar un hex de 3
  // dígitos (`#ABC`), que `parseHex` acepta pero nunca casaría contra los 6
  // dígitos de la paleta y dejaría la cuadrícula sin marcar.
  const current = rgbToHex(parseHex(value) ?? BLACK)
  return (
    <div className="grid grid-cols-12 gap-1.5">
      {GRID_COLORS.map((hex) => {
        const selected = hex === current
        return (
          <motion.button
            key={hex}
            type="button"
            onClick={() => onPick(hex)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label={hex}
            aria-pressed={selected}
            className="aspect-square w-full cursor-pointer rounded-full"
            style={{
              background: hex,
              boxShadow: selected
                ? '0 0 0 2px var(--bg-base), 0 0 0 3.5px var(--accent-light)'
                : '0 0 0 1px var(--lg-ic-border)',
            }}
          />
        )
      })}
    </div>
  )
}

const SPECTRUM_HEIGHT = 190
/** Paso por pulsación de flecha: grados de matiz y fracción de luminosidad. */
const HUE_KEY_STEP = 5
const VALUE_KEY_STEP = 0.04

/**
 * Matiz en horizontal, luminosidad en vertical. La saturación se mantiene: con
 * tres dimensiones en dos ejes hay que fijar una, y el eje de luminosidad es el
 * que la gente busca (un azul "más oscuro"), no el de saturación.
 */
function SpectrumView({ hsv, onPick }: { hsv: Hsv; onPick: (next: Hsv) => void }) {
  const area = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function pickAt(clientX: number, clientY: number) {
    const box = area.current?.getBoundingClientRect()
    if (!box) return
    const x = clamp01((clientX - box.left) / box.width)
    const y = clamp01((clientY - box.top) / box.height)
    // Arriba = claro, abajo = oscuro: es el orden que espera la mano y el mismo
    // del degradado que se pinta debajo. La saturación no se toca aquí — la
    // gobierna su propio slider.
    onPick({ h: x * 360, s: hsv.s, v: 1 - y })
  }

  // Sin teclado el espectro es inoperable para quien no usa puntero, y es el
  // control principal de esta vista.
  function onKeyDown(e: React.KeyboardEvent) {
    const move: Record<string, Partial<Hsv>> = {
      ArrowLeft: { h: hsv.h - HUE_KEY_STEP },
      ArrowRight: { h: hsv.h + HUE_KEY_STEP },
      ArrowUp: { v: clamp01(hsv.v + VALUE_KEY_STEP) },
      ArrowDown: { v: clamp01(hsv.v - VALUE_KEY_STEP) },
    }
    const delta = move[e.key]
    if (!delta) return
    e.preventDefault()
    onPick({ ...hsv, ...delta })
  }

  // Eventos de PUNTERO (no de ratón) + `touch-none`: en móvil, sin ellos el
  // gesto lo captura el scroll del sheet y el espectro no se puede arrastrar.
  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    area.current?.setPointerCapture(e.pointerId)
    pickAt(e.clientX, e.clientY)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    pickAt(e.clientX, e.clientY)
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return
    dragging.current = false
    area.current?.releasePointerCapture(e.pointerId)
  }

  const left = `${(((hsv.h % 360) + 360) % 360) / 360 * 100}%`
  const top = `${(1 - hsv.v) * 100}%`

  return (
    <div>
      <div
        ref={area}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Espectro de color: arrastra o usa las flechas para elegir matiz y luminosidad"
        className="relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[16px]"
        style={{ height: SPECTRUM_HEIGHT, boxShadow: '0 0 0 1px var(--lg-ic-border)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%)',
          }}
        />
        {/* Negro por encima hace el eje vertical de luminosidad sin recalcular
            el degradado de matiz en cada frame. */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)' }}
        />

        <span
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left,
            top,
            background: rgbToHex(hsvToRgb(hsv)),
            boxShadow: '0 0 0 2.5px #fff, 0 1px 5px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      <SliderRow
        label="Saturación"
        value={Math.round(hsv.s * 100)}
        max={100}
        onChange={(n) => onPick({ ...hsv, s: n / 100 })}
        track={`linear-gradient(to right, ${rgbToHex(hsvToRgb({ ...hsv, s: 0 }))}, ${rgbToHex(hsvToRgb({ ...hsv, s: 1 }))})`}
      />
    </div>
  )
}

function SlidersView({ rgb, onPick }: { rgb: Rgb; onPick: (next: Rgb) => void }) {
  return (
    <div>
      <SliderRow
        label="Rojo"
        value={Math.round(rgb.r)}
        max={255}
        onChange={(r) => onPick({ ...rgb, r })}
        track={`linear-gradient(to right, ${rgbToHex({ ...rgb, r: 0 })}, ${rgbToHex({ ...rgb, r: 255 })})`}
      />
      <SliderRow
        label="Verde"
        value={Math.round(rgb.g)}
        max={255}
        onChange={(g) => onPick({ ...rgb, g })}
        track={`linear-gradient(to right, ${rgbToHex({ ...rgb, g: 0 })}, ${rgbToHex({ ...rgb, g: 255 })})`}
      />
      <SliderRow
        label="Azul"
        value={Math.round(rgb.b)}
        max={255}
        onChange={(b) => onPick({ ...rgb, b })}
        track={`linear-gradient(to right, ${rgbToHex({ ...rgb, b: 0 })}, ${rgbToHex({ ...rgb, b: 255 })})`}
      />
    </div>
  )
}

interface SliderRowProps {
  label: string
  value: number
  max: number
  onChange: (n: number) => void
  /** Degradado del canal: se ve a qué color lleva el deslizador antes de moverlo. */
  track: string
}

function SliderRow({ label, value, max, onChange, track }: SliderRowProps) {
  return (
    <div className="pt-3.5">
      <div className="flex items-baseline justify-between pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
          {label}
        </span>
        <span className="mono-amount text-[12px] font-bold tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="color-slider w-full cursor-pointer touch-none"
        style={{ background: track }}
      />
    </div>
  )
}
