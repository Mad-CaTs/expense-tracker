'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Wallet } from 'lucide-react'

import { CategorySheet } from '@/components/features/categories/CategorySheet'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { Category, CategoryType } from '@/types'

interface CategorySelectorProps {
  type: CategoryType
  categories?: Category[]
  selectedId: string
  error?: string
  onSelect: (categoryId: string) => void
  onCreated: (category: Category) => void
}

export function CategorySelector({ type, categories, selectedId, error, onSelect, onCreated }: CategorySelectorProps) {
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      <div className="pt-2 pb-2">
        <div className="mx-4 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
        <div className="mb-3 flex items-center justify-between px-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Categoría
          </p>
          {error && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
          <div className="shrink-0 pl-4" />
          {categories?.map((cat) => {
            const Icon = cat.icon ? (CATEGORY_ICON_MAP[cat.icon] ?? Wallet) : Wallet
            const color = cat.color ?? '#d4af37'
            const selected = selectedId === cat.id.toString()
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id.toString())}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-colors"
                style={{
                  background: selected ? `${color}18` : 'var(--bg-input)',
                  boxShadow: selected ? `0 0 0 1.5px ${color}60` : 'none',
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: selected ? `${color}25` : `${color}12` }}
                >
                  <Icon size={18} style={{ color }} strokeWidth={1.7} />
                </div>
                <span
                  className="text-center text-[10px] font-semibold leading-tight"
                  style={{ color: selected ? color : 'var(--text-muted)' }}
                >
                  {cat.name}
                </span>
              </motion.button>
            )
          })}
          {/* + Nueva categoría */}
          <motion.button
            type="button"
            onClick={() => setShowSheet(true)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 transition-colors"
            style={{ border: '1px dashed var(--border-strong)' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--bg-input)' }}>
              <Plus size={18} style={{ color: 'var(--text-muted)' }} strokeWidth={1.7} />
            </div>
            <span className="text-center text-[10px] font-semibold leading-tight" style={{ color: 'var(--text-muted)' }}>
              Nueva
            </span>
          </motion.button>
          <div className="shrink-0 pr-4" />
        </div>
      </div>

      {/* Category sheet — quick create */}
      <AnimatePresence>
        {showSheet && (
          <CategorySheet
            type={type}
            onClose={() => setShowSheet(false)}
            onCreated={onCreated}
          />
        )}
      </AnimatePresence>
    </>
  )
}
