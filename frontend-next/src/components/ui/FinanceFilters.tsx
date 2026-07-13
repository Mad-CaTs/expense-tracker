'use client'

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, ListFilter, Layers, Tag, X } from 'lucide-react'
import { nanoid } from 'nanoid'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Category } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export enum FinanceFilterType {
  FECHA = 'Fecha',
  CATEGORIA = 'Categoría',
  TIPO = 'Tipo de Registro',
}

export enum TxType {
  ALL = 'Todos',
  EXPENSE = 'Gastos',
  INCOME = 'Ingresos',
}

export enum DatePreset {
  THIS_MONTH = 'Este mes',
  LAST_MONTH = 'Mes anterior',
  THIS_YEAR = 'Este año',
  LAST_7_DAYS = 'Últimos 7 días',
  LAST_30_DAYS = 'Últimos 30 días',
  LAST_90_DAYS = 'Últimos 90 días',
}

export type FinanceFilter = {
  id: string
  type: FinanceFilterType
  value: string[]
}

// ─── Height animation ──────────────────────────────────────────────────────────

function AnimateChangeInHeight({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => setHeight(entries[0].contentRect.height))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      className="overflow-hidden"
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.12, ease: 'easeInOut' }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  )
}

// ─── Date preset helper ────────────────────────────────────────────────────────

function datePresetToRange(preset: string): { from: string; to: string } | null {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)

  switch (preset) {
    case DatePreset.THIS_MONTH:
      return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: today }
    case DatePreset.LAST_MONTH: {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: fmt(first), to: fmt(last) }
    }
    case DatePreset.THIS_YEAR:
      return { from: `${now.getFullYear()}-01-01`, to: today }
    case DatePreset.LAST_7_DAYS: {
      const d = new Date(now); d.setDate(d.getDate() - 7)
      return { from: fmt(d), to: today }
    }
    case DatePreset.LAST_30_DAYS: {
      const d = new Date(now); d.setDate(d.getDate() - 30)
      return { from: fmt(d), to: today }
    }
    case DatePreset.LAST_90_DAYS: {
      const d = new Date(now); d.setDate(d.getDate() - 90)
      return { from: fmt(d), to: today }
    }
    default:
      return null
  }
}

export function applyFinanceFilters(
  filters: FinanceFilter[]
): { startDate?: string; endDate?: string; categoryIds?: number[]; txType: 'all' | 'expense' | 'income' } {
  const result: { startDate?: string; endDate?: string; categoryIds?: number[]; txType: 'all' | 'expense' | 'income' } = {
    txType: 'all',
  }

  for (const f of filters) {
    if (f.type === FinanceFilterType.FECHA && f.value[0]) {
      const range = datePresetToRange(f.value[0])
      if (range) { result.startDate = range.from; result.endDate = range.to }
    }
    const realCategoryValues = f.value.filter(v => v !== '__open__')
    if (f.type === FinanceFilterType.CATEGORIA && realCategoryValues.length > 0) {
      result.categoryIds = realCategoryValues.map(Number)
    }
    if (f.type === FinanceFilterType.TIPO && f.value[0]) {
      if (f.value[0] === TxType.EXPENSE) result.txType = 'expense'
      else if (f.value[0] === TxType.INCOME) result.txType = 'income'
    }
  }

  return result
}

// ─── Active filter chip ────────────────────────────────────────────────────────

function FilterChip({
  filter,
  categories,
  defaultOpen = false,
  excludeTxTypes = [],
  onRemove,
  onChangeValue,
}: {
  filter: FinanceFilter
  categories: Category[]
  defaultOpen?: boolean
  excludeTxTypes?: TxType[]
  onRemove: () => void
  onChangeValue: (value: string[]) => void
}) {
  const [open, setOpen] = useState(defaultOpen)

  // Real values: exclude the sentinel
  const realValues = filter.value.filter(v => v !== '__open__')

  const label =
    filter.type === FinanceFilterType.FECHA
      ? (realValues[0] ?? '—')
      : filter.type === FinanceFilterType.TIPO
        ? (realValues[0] ?? TxType.ALL)
        : realValues.length === 0
          ? 'Seleccionar...'
          : realValues.length === 1
            ? (categories.find(c => String(c.id) === realValues[0])?.name ?? '—')
            : `${realValues.length} categorías`

  const Icon = filter.type === FinanceFilterType.FECHA ? Calendar
    : filter.type === FinanceFilterType.TIPO ? Layers
    : Tag

  return (
    <div className="flex items-center gap-[1px] text-[11px] font-medium">
      {/* Type label */}
      <div
        className="flex items-center gap-1.5 rounded-l-full px-2.5 py-1.5"
        style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
      >
        <Icon size={11} />
        <span>{filter.type}</span>
      </div>

      {/* Value selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="px-2.5 py-1.5 transition-colors cursor-pointer"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
        >
          {label}
        </PopoverTrigger>
        <PopoverContent
          className="w-[200px] p-1 border-0"
          style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--card-shadow)' }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // only close when clicking truly outside
            const target = e.target as HTMLElement
            if (!target.closest('[data-radix-popper-content-wrapper]')) setOpen(false)
          }}
        >
          <div onMouseDown={(e) => e.preventDefault()}>
            {filter.type === FinanceFilterType.TIPO
              ? Object.values(TxType).filter(opt => !excludeTxTypes.includes(opt)).map(opt => (
                  <button
                    key={opt}
                    onMouseDown={(e) => { e.preventDefault(); onChangeValue([opt]); setOpen(false) }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-left transition-colors cursor-pointer"
                    style={{
                      color: realValues[0] === opt ? 'var(--accent-light)' : 'var(--text-secondary)',
                      background: realValues[0] === opt ? 'var(--accent-bg)' : 'transparent',
                    }}
                  >
                    {realValues[0] === opt && <Check size={11} />}
                    {opt}
                  </button>
                ))
              : filter.type === FinanceFilterType.FECHA
              ? Object.values(DatePreset).map(preset => (
                  <button
                    key={preset}
                    onMouseDown={(e) => { e.preventDefault(); onChangeValue([preset]); setOpen(false) }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-left transition-colors cursor-pointer"
                    style={{
                      color: realValues[0] === preset ? 'var(--accent-light)' : 'var(--text-secondary)',
                      background: realValues[0] === preset ? 'var(--accent-bg)' : 'transparent',
                    }}
                  >
                    {realValues[0] === preset && <Check size={11} />}
                    {preset}
                  </button>
                ))
              : categories.map(cat => {
                  const idStr = String(cat.id)
                  const selected = realValues.includes(idStr)
                  return (
                    <button
                      key={cat.id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        const next = selected
                          ? realValues.filter(x => x !== idStr)
                          : [...realValues, idStr]
                        onChangeValue(next)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-left transition-colors cursor-pointer"
                      style={{
                        color: selected ? 'var(--accent-light)' : 'var(--text-secondary)',
                        background: selected ? 'var(--accent-bg)' : 'transparent',
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: selected ? 'var(--accent-light)' : cat.color ?? 'var(--border-strong)' }}
                      />
                      {cat.name}
                    </button>
                  )
                })
            }
          </div>
        </PopoverContent>
      </Popover>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="rounded-r-full px-1.5 py-1.5 transition-colors cursor-pointer"
        style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
        aria-label="Quitar filtro"
      >
        <X size={11} />
      </button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface FinanceFiltersProps {
  filters: FinanceFilter[]
  setFilters: Dispatch<SetStateAction<FinanceFilter[]>>
  categories?: Category[]
  excludeTxTypes?: TxType[]
  excludeFilterTypes?: FinanceFilterType[]
  hideControls?: boolean
}

const FILTER_OPTIONS = [
  { type: FinanceFilterType.FECHA, icon: <Calendar size={13} />, defaultValue: [DatePreset.THIS_MONTH] },
  { type: FinanceFilterType.TIPO, icon: <Layers size={13} />, defaultValue: [TxType.EXPENSE] },
  { type: FinanceFilterType.CATEGORIA, icon: <Tag size={13} />, defaultValue: ['__open__'] },
]

export function FinanceFilters({ filters, setFilters, categories = [], excludeTxTypes = [], excludeFilterTypes = [], hideControls = false }: FinanceFiltersProps) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTxType = filters.find(f => f.type === FinanceFilterType.TIPO)?.value[0]
  const isExpensesOnly = activeTxType === TxType.EXPENSE

  // Only show Categoría chip when filtering by Gastos; also hide excluded filter types
  const activeFilters = (isExpensesOnly ? filters : filters.filter(f => f.type !== FinanceFilterType.CATEGORIA))
    .filter(f => !excludeFilterTypes.includes(f.type))

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2">
      {/* Active chips */}
      <AnimatePresence mode="popLayout">
        {activeFilters.map(filter => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <FilterChip
              filter={filter}
              categories={categories}
              defaultOpen={filter.type === FinanceFilterType.CATEGORIA && filter.value.includes('__open__')}
              excludeTxTypes={excludeTxTypes}
              onRemove={() => setFilters(prev => prev.filter(f => f.id !== filter.id))}
              onChangeValue={(value) => setFilters(prev => prev.map(f => f.id === filter.id ? { ...f, value } : f))}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Clear all */}
      {!hideControls && filters.some(f => f.value.filter(v => v !== '__open__').length > 0) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setFilters([])}
          className="rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
        >
          Limpiar
        </motion.button>
      )}

      {/* Add filter button */}
      {!hideControls && <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTimeout(() => setCommandInput(''), 150) }}>
        <PopoverTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
            style={{
              background: activeFilters.length > 0 ? 'transparent' : 'var(--bg-input)',
              color: 'var(--text-muted)',
              border: activeFilters.length > 0 ? '1px dashed var(--border-subtle)' : 'none',
            }}
            aria-label="Filtrar"
          >
            <ListFilter size={12} />
            {!activeFilters.length && <span>Filtrar</span>}
          </motion.button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[180px] p-0 border-0"
          align="start"
          style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--card-shadow)' }}
        >
          <AnimateChangeInHeight>
            <Command style={{ background: 'transparent', color: 'var(--text-primary)' }}>
              <CommandInput
                ref={inputRef}
                placeholder="Filtrar por..."
                className="h-9 text-[12px]"
                style={{ color: 'var(--text-primary)' }}
                value={commandInput}
                onInput={(e) => setCommandInput(e.currentTarget.value)}
              />
              <CommandList>
                <CommandEmpty className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Sin opciones</CommandEmpty>
                <CommandGroup>
                  {FILTER_OPTIONS.map(opt => {
                    const alreadyActive = filters.some(f => f.type === opt.type)
                    if (alreadyActive) return null
                    if (excludeFilterTypes.includes(opt.type)) return null
                    if (opt.type === FinanceFilterType.CATEGORIA && !isExpensesOnly) return null
                    return (
                      <CommandItem
                        key={opt.type}
                        value={opt.type}
                        className="text-[12px] cursor-pointer gap-2 data-[selected=true]:bg-[var(--bg-hover)] data-[selected=true]:text-[var(--text-primary)]"
                        style={{ color: 'var(--text-secondary)' }}
                        onSelect={() => {
                          setFilters(prev => [...prev, {
                            id: nanoid(),
                            type: opt.type,
                            value: opt.defaultValue,
                          }])
                          setOpen(false)
                          setTimeout(() => setCommandInput(''), 150)
                        }}
                      >
                        {opt.icon}
                        {opt.type}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>}
    </div>
  )
}
