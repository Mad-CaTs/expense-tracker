'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'

import { CategoriesManager } from '@/components/features/categories/CategoriesManager'
import { PageHeader } from '@/components/layout/PageHeader'
import { useCategories } from '@/lib/hooks/useCategories'
import type { CategoryType } from '@/types'

const TABS: { type: CategoryType; label: string }[] = [
  { type: 'EXPENSE', label: 'Gasto' },
  { type: 'INCOME', label: 'Ingreso' },
]

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const [activeType, setActiveType] = useState<CategoryType>('EXPENSE')

  const filtered = (categories ?? []).filter((c) =>
    activeType === 'INCOME' ? c.type === 'INCOME' : c.type !== 'INCOME'
  )

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Categorías" />

      <div className="px-4">
        {/* Segmented Gasto | Ingreso */}
        <div className="mb-4 flex gap-1.5">
          {TABS.map(({ type, label }) => (
            <motion.button
              key={type}
              onClick={() => setActiveType(type)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors"
              style={
                activeType === type
                  ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
                  : { background: 'var(--bg-input)', color: 'var(--text-muted)' }
              }
            >
              {label}
            </motion.button>
          ))}
        </div>

        <CategoriesManager
          key={activeType}
          type={activeType}
          categories={filtered}
          isLoading={isLoading}
          deleteDescription={
            activeType === 'INCOME'
              ? 'Los ingresos asociados perderán su categoría.'
              : 'Los gastos asociados perderán su categoría.'
          }
        />
      </div>
    </div>
  )
}
