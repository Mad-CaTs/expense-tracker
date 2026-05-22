'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { Select } from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useFilterStore } from '@/stores/filterStore'
import type { Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'MONTHLY', label: 'Este mes' },
  { value: 'LAST_MONTH', label: 'Anterior' },
  { value: 'YEARLY', label: 'Este año' },
]

export function ExpenseFilters() {
  const { period, categoryId, filtersOpen, setPeriod, setCategoryId, toggleFilters } =
    useFilterStore()
  const { data: categories } = useCategories()

  return (
    <div className="border-b border-[#111] px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        {/* Segmented control — pill container */}
        <div className="flex gap-0.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] p-0.5">
          {PERIODS.map(({ value, label }) => {
            const active = period === value
            return (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className="relative rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150"
                style={{ color: active ? '#060606' : '#484848' }}
              >
                {active && (
                  <motion.span
                    layoutId="period-active"
                    className="bg-gold absolute inset-0 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Filter toggle */}
        <button
          onClick={toggleFilters}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0a0a0a] transition-colors duration-150 hover:border-[#242424] hover:bg-[#111]"
          style={{ color: filtersOpen ? '#d4af37' : '#484848' }}
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
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">
              <Select
                value={categoryId?.toString() ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
