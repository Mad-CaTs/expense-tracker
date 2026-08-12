'use client'

import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { Category } from '@/types'

interface CategorySelectorProps {
  categories?: Category[]
  selectedId: string
  error?: string
  onSelect: (categoryId: string) => void
}

/**
 * Elegir categoría es obligatorio, así que la selección NO alterna: volver a
 * tocar la elegida la deja elegida. Alternar dejaba el formulario sin categoría
 * con el mismo gesto que se usa para confirmarla.
 *
 * Tampoco crea categorías: eso vive en /categories. Un formulario de gasto no
 * es el lugar para dar de alta taxonomía.
 */
export function CategorySelector({ categories, selectedId, error, onSelect }: CategorySelectorProps) {
  return (
    <>
      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Categoría
      </p>
      {/* Chips que envuelven, no un carrusel horizontal: con pocas categorías
          entran todas a la vista y no hay que descubrir que se scrollea. */}
      <div className="flex flex-wrap gap-2">
        {categories?.map((cat) => {
          const Icon = cat.icon ? (CATEGORY_ICON_MAP[cat.icon] ?? Wallet) : Wallet
          const color = cat.color ?? '#d4af37'
          const tint = categorySwatch(color)
          const selected = selectedId === cat.id.toString()
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id.toString())}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex h-10 cursor-pointer items-center gap-[7px] rounded-[13px] border px-3.5 text-[12.5px] font-bold transition-colors"
              style={selected
                ? { background: `${color}22`, borderColor: tint, color: tint }
                : { background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
            >
              <Icon
                size={16}
                strokeWidth={1.85}
                style={{
                  color: selected ? tint : 'var(--text-muted)',
                  transition: 'color var(--dur-tint) var(--ease-sys)',
                }}
              />
              {cat.name}
            </motion.button>
          )
        })}

      </div>
      {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
    </>
  )
}
