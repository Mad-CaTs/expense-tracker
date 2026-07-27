'use client'

import { AnimatePresence, motion } from 'framer-motion'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import { useFilterStore } from '@/stores/filterStore'
import type { Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'MONTHLY', label: 'Este mes' },
  { value: 'LAST_MONTH', label: 'Anterior' },
  { value: 'YEARLY', label: 'Este año' },
]

export function ExpenseFilters({ onNew }: { onNew?: () => void }) {
  const { period, categoryId, filtersOpen, setPeriod, setCategoryId, toggleFilters } =
    useFilterStore()
  const { data: categories } = useCategories('EXPENSE')

  return (
    <div className="border-b px-4 pt-3 pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-2">
        {/* Segmented control — pill container */}
        <div className="flex gap-0.5 rounded-full border p-0.5" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-subtle)' }}>
          {PERIODS.map(({ value, label }) => {
            const active = period === value
            return (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className="relative rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150"
                style={{ color: active ? 'var(--bg-base)' : 'var(--text-muted)' }}
              >
                {active && (
                  <motion.span
                    layoutId="period-active"
                    className="bg-gold absolute inset-0 rounded-full"
                    transition={{ duration: MOTION_S.tint, ease: EASE }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            )
          })}
        </div>

        {/* New button */}
        {onNew && (
          <button
            onClick={onNew}
            className="flex h-8 items-center gap-1 rounded-full px-3 text-[11px] font-bold"
            style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
          >
            + Nuevo
          </button>
        )}

        {/* Filter toggle */}
        <button
          onClick={toggleFilters}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150"
          style={{
            borderColor: 'var(--border-default)',
            background: 'var(--bg-subtle)',
            color: filtersOpen ? 'var(--accent)' : 'var(--text-muted)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
          aria-label="Mostrar filtros"
          aria-expanded={filtersOpen}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54Z" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: MOTION_S.layer, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">
              <Select
                value={categoryId?.toString() ?? 'all'}
                onValueChange={(v) => setCategoryId(v === 'all' ? undefined : Number(v))}
              >
                <SelectTrigger aria-label="Filtrar por categoría">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
