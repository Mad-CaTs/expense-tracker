'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { Select } from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useFilterStore } from '@/stores/filterStore'
import type { Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'MONTHLY', label: 'Este mes' },
  { value: 'LAST_MONTH', label: 'Mes anterior' },
  { value: 'YEARLY', label: 'Este año' },
]

export function ExpenseFilters() {
  const { period, categoryId, filtersOpen, setPeriod, setCategoryId, toggleFilters } =
    useFilterStore()
  const { data: categories } = useCategories()

  return (
    <div className="border-b border-[#1a1a1a] px-4 pt-4 pb-2">
      <div className="mb-3 flex items-center gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              period === value
                ? { background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#080808' }
                : { background: '#161616', color: '#888' }
            }
          >
            {label}
          </button>
        ))}
        <button
          onClick={toggleFilters}
          className="ml-auto rounded-xl p-2 text-[#555] transition-colors hover:bg-[#161616] hover:text-[#e2e0d5]"
          aria-label="Mostrar filtros"
          aria-expanded={filtersOpen}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3">
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
