'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'framer-motion'
import { ArrowLeftRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Pencil, RotateCcw, SlidersHorizontal, X } from 'lucide-react'

import { PeriodPicker } from '@/components/features/reports/PeriodPicker'
import { RangeCalendar } from '@/components/features/reports/RangeCalendar'
import type { Granularity } from '@/components/features/reports/usePeriodRange'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { MOTION } from '@/lib/utils/motion'
import type { Category } from '@/types'

export type ReportTxType = 'EXPENSE' | 'INCOME' | 'ALL'

export interface ReportFilterState {
  categoryIds: number[]
  granularity: Granularity
  txType: ReportTxType
}

interface ReportFiltersProps {
  state: ReportFilterState
  categories: Category[]
  periodLabel: string
  range: { from: string; to: string }
  isCurrent: boolean
  isCustom: boolean
  onChange: (next: ReportFilterState) => void
  onNavigate: (delta: number) => void
  onRange: (from: string, to: string) => void
  periodDate: Date
  onPeriod: (granularity: Granularity, date: Date) => void
  onReset: () => void
  hideTxType?: boolean
}

const TX_LABEL: Record<ReportTxType, string> = {
  ALL: 'Todo',
  EXPENSE: 'Gastos',
  INCOME: 'Ingresos',
}

interface Draft {
  categoryIds: number[]
  txType: ReportTxType
  granularity: Granularity
  free: boolean
  range: { from: string; to: string } | null
  date: Date | null
}

const PERIOD_PRESETS: { key: Granularity; text: string }[] = [
  { key: 'MONTHLY', text: 'Mes' },
  { key: 'QUARTERLY', text: '3 Meses' },
  { key: 'YEARLY', text: 'Año' },
]

type Panel = 'category' | 'period' | 'type'

export function ReportFilters({
  state, categories, periodLabel, range, isCurrent, isCustom, periodDate,
  onChange, onNavigate, onRange, onPeriod, onReset, hideTxType = false,
}: ReportFiltersProps) {
  const [panel, setPanel] = useState<Panel | null>(null)
  const [closing, setClosing] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const exitTimer = useRef<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<Draft | null>(null)

  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setClosing(true)
    exitTimer.current = window.setTimeout(() => {
      setPanel(null)
      setClosing(false)
      exitTimer.current = null
    }, MOTION.tint)
  }, [])

  function open(next: Panel) {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current)
      exitTimer.current = null
      setClosing(false)
    }
    const box = root.current?.getBoundingClientRect()
    if (box) setAnchor({ top: box.bottom + 8, left: box.left, width: box.width })
    setDraft({
      categoryIds: state.categoryIds,
      txType: state.txType,
      granularity: state.granularity,
      free: isCustom,
      range: isCustom ? range : null,
      date: periodDate,
    })
    setPanel((prev) => (prev === next ? null : next))
  }

  const draftRange = draft?.range ?? range

  function apply() {
    if (!draft) return close()

    if (draft.free && draft.range) {
      onRange(draft.range.from, draft.range.to)
    } else if (!draft.free) {
      onPeriod(draft.granularity, draft.date ?? periodDate)
    }

    onChange({
      categoryIds: draft.categoryIds,
      txType: draft.txType,
      granularity: draft.free ? state.granularity : draft.granularity,
    })
    close()
  }

  useEffect(() => () => {
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
  }, [])

  useEffect(() => {
    if (!panel) return
    function reposition() {
      const box = root.current?.getBoundingClientRect()
      if (box) setAnchor({ top: box.bottom + 8, left: box.left, width: box.width })
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [panel])

  useEffect(() => {
    if (!panel) return
    function onDown(e: PointerEvent) {
      const target = e.target as Node
      if (root.current?.contains(target) || panelRef.current?.contains(target)) return
      close()
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [panel, close])

  const dirty = state.categoryIds.length > 0
    || state.txType !== 'ALL'
    || state.granularity !== 'MONTHLY'
    || isCustom
    || !isCurrent

  const selected = draft?.categoryIds ?? state.categoryIds
  const categoryLabel = state.categoryIds.length === 0
    ? 'Categoría'
    : state.categoryIds.length === 1
      ? categories.find((c) => c.id === state.categoryIds[0])?.name ?? 'Categoría'
      : `${state.categoryIds.length} categorías`

  function toggleCategory(id: number) {
    setDraft((d) => d && ({
      ...d,
      categoryIds: d.categoryIds.includes(id) ? d.categoryIds.filter((x) => x !== id) : [...d.categoryIds, id],
    }))
  }

  return (
    <div ref={root} className="relative mb-[18px]">
      {/* -mx-4 + px-4: los chips sangran hasta el borde al scrollear, pero
          arrancan alineados con el contenido. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {/* Solo con un tipo concreto: con "Todo" la lista mezcla gastos e
            ingresos y una categoría de gasto vaciaría los ingresos sin decir
            por qué. El tipo acota primero, la categoría después. */}
        {state.txType !== 'ALL' && (
          <Chip
            icon={<SlidersHorizontal size={13} strokeWidth={2} />}
            label={categoryLabel}
            on={selected.length > 0}
            onClick={() => open('category')}
          />
        )}

        {/* El chip de período incorpora sus flechas: una fila aparte repetía la
            misma etiqueta y la misma granularidad. */}
        <span className="flex flex-none items-center rounded-full px-0.5" style={{ background: 'var(--accent-light)' }}>
          <motion.button
            type="button"
            onClick={() => onNavigate(-1)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label="Período anterior"
            className="flex h-8 w-7 cursor-pointer items-center justify-center rounded-full"
            style={{ color: 'var(--bg-base)' }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => open('period')}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex h-9 cursor-pointer items-center gap-1.5 px-1 text-[12px] font-bold"
            style={{ color: 'var(--bg-base)' }}
          >
            <CalendarDays size={13} strokeWidth={2} />
            {periodLabel}
            <ChevronDown size={11} strokeWidth={2.5} />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => !isCurrent && onNavigate(1)}
            disabled={isCurrent}
            whileTap={isCurrent ? undefined : { scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label="Período siguiente"
            className="flex h-8 w-7 items-center justify-center rounded-full"
            style={{ color: 'var(--bg-base)', opacity: isCurrent ? 0.3 : 1, cursor: isCurrent ? 'default' : 'pointer' }}
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </motion.button>
        </span>

        {!hideTxType && (
          <Chip
            icon={<ArrowLeftRight size={13} strokeWidth={2} />}
            label={TX_LABEL[state.txType]}
            on={state.txType !== 'ALL'}
            onClick={() => open('type')}
          />
        )}

        {/* Solo cuando hay algo que restablecer: con todo por defecto sería un
            botón que no hace nada, ocupando sitio en una fila que ya scrollea. */}
        {dirty && (
          <motion.button
            type="button"
            onClick={() => { close(); onReset() }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label="Restablecer filtros"
            className="liquid-glass-ic flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full"
            style={{ color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={14} strokeWidth={2} />
          </motion.button>
        )}
      </div>

      {/* Desenfoca la página, no el panel: el velo casi opaco del panel tapa su
          propio backdrop-filter, así que el blur vive en una capa aparte.
          Va por PORTAL porque un ancestro con `transform` (.enter-pop) crea un
          contenedor de bloque y un `fixed` dentro dejaría de cubrir la pantalla. */}
      {panel && anchor && createPortal(
        <div
          className="fixed inset-0 z-30"
          style={{
            backdropFilter: 'blur(14px) saturate(0.9)',
            WebkitBackdropFilter: 'blur(14px) saturate(0.9)',
            background: 'rgba(0,0,0,0.28)',
            animation: closing
              ? 'backdrop-out var(--dur-tint) var(--ease-sys) both'
              : 'backdrop-in var(--dur-layer) var(--ease-sys) both',
          }}
          aria-hidden
        />,
        document.body,
      )}

      {panel && anchor && createPortal(
        <div
          ref={panelRef}
          className={`liquid-glass z-40 rounded-[20px] p-4 ${closing ? 'anchor-out' : 'anchor-in'}`}
          style={{
            position: 'fixed',
            top: anchor.top,
            left: anchor.left,
            width: anchor.width,
            maxHeight: `calc(100dvh - ${anchor.top + 16}px)`,
            overflowY: 'auto',
            backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
              {panel === 'category' ? 'Categoría' : panel === 'period' ? 'Período' : 'Tipo'}
            </p>
            <motion.button
              type="button"
              onClick={close}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              aria-label="Cerrar"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            >
              <X size={13} />
            </motion.button>
          </div>

          {panel === 'type' && draft && (
            <>
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'EXPENSE', 'INCOME'] as ReportTxType[]).map((t) => (
                  <Pill
                    key={t}
                    label={TX_LABEL[t]}
                    on={draft.txType === t}
                    onClick={() => setDraft((d) => d && ({ ...d, txType: t, categoryIds: [] }))}
                  />
                ))}
              </div>
              <ApplyButton onClick={apply} />
            </>
          )}

          {panel === 'period' && draft && (
            <>
              <div className="mb-3.5 flex flex-wrap gap-2">
                {PERIOD_PRESETS.map(({ key, text }) => (
                  <Pill
                    key={key}
                    label={text}
                    on={!draft.free && draft.granularity === key}
                    onClick={() => setDraft((d) => d && ({ ...d, granularity: key, free: false, range: null, date: null }))}
                  />
                ))}

                {/* Rango libre: el lápiz lo distingue de los presets, que son
                    períodos con forma fija. */}
                <motion.button
                  type="button"
                  onClick={() => setDraft((d) => d && ({ ...d, free: true }))}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  aria-label="Rango personalizado"
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-[13px] border${draft.free ? '' : ' liquid-glass-ic'}`}
                  style={draft.free
                    ? { background: 'var(--accent-light)', borderColor: 'var(--accent-light)', color: 'var(--bg-base)' }
                    : { borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
                >
                  <Pencil size={14} strokeWidth={2} />
                </motion.button>
              </div>

              {/* Con preset se elige el período (marzo, Q2, 2024) en una rejilla
                  acorde; el calendario de días solo tiene sentido en modo libre,
                  donde los extremos los pone el usuario. */}
              <div className="border-t pt-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
                {draft.free ? (
                  <RangeCalendar
                    from={draftRange.from}
                    to={draftRange.to}
                    onSelect={(from, to) => setDraft((d) => d && ({ ...d, range: { from, to } }))}
                  />
                ) : (
                  <PeriodPicker
                    key={draft.granularity}
                    granularity={draft.granularity}
                    value={draft.date ?? periodDate}
                    onSelect={(date) => setDraft((d) => d && ({ ...d, date, range: null }))}
                  />
                )}
              </div>

              <ApplyButton onClick={apply} />
            </>
          )}

          {panel === 'category' && draft && (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill
                  label="Todas"
                  on={selected.length === 0}
                  onClick={() => setDraft((d) => d && ({ ...d, categoryIds: [] }))}
                />
              </div>

              {/* Sin agrupar por tipo: el chip solo existe con un tipo ya
                  elegido, así que todas las de la lista son de ese tipo. */}
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const color = c.color ?? '#d4af37'
                  const tint = categorySwatch(color)
                  const on = selected.includes(c.id)
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex h-10 cursor-pointer items-center gap-[7px] rounded-[13px] border px-3.5 text-[12.5px] font-bold"
                      style={on
                        ? { background: `${color}22`, borderColor: tint, color: tint }
                        : { background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
                    >
                      <span className="h-2 w-2 rounded-[3px]" style={{ background: tint }} />
                      {c.name}
                    </motion.button>
                  )
                })}
              </div>

              <ApplyButton onClick={apply} />
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}

function ApplyButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="mt-4 h-11 w-full cursor-pointer rounded-full text-[13px] font-bold"
      style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
    >
      Aplicar
    </motion.button>
  )
}

function Chip({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex h-9 flex-none cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold${on ? '' : ' liquid-glass-ic'}`}
      style={on
        ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
        : { color: 'var(--text-secondary)' }}
    >
      {icon}
      <span className="max-w-[110px] truncate">{label}</span>
      <ChevronDown size={11} strokeWidth={2.5} className="flex-none" />
    </motion.button>
  )
}

function Pill({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex h-10 cursor-pointer items-center rounded-[13px] border px-4 text-[12.5px] font-bold${on ? '' : ' liquid-glass-ic'}`}
      style={on
        ? { background: 'var(--accent-light)', borderColor: 'var(--accent-light)', color: 'var(--bg-base)' }
        : { borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
    >
      {label}
    </motion.button>
  )
}
