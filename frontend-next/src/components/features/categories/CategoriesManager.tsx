'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteCategory } from '@/lib/hooks/useCategories'
import type { Category, CategoryType } from '@/types'
import { CategoryRow } from './CategoryRow'
import { CreateCategoryForm } from './CreateCategoryForm'

interface CategoriesManagerProps {
  type: CategoryType
  categories: Category[]
  isLoading: boolean
  deleteDescription: string
}

export function CategoriesManager({ type, categories, isLoading, deleteDescription }: CategoriesManagerProps) {
  const deleteCategory = useDeleteCategory()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div
      className="rounded-[18px] border px-4"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
    >
      {/* Add button row */}
      <div className="flex items-center justify-between border-b py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {categories.length} categoría{categories.length !== 1 ? 's' : ''}
        </p>
        <motion.button
          onClick={() => { setShowCreate((v) => !v); setEditingId(null) }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {showCreate ? <X size={11} /> : <Plus size={11} />}
          {showCreate ? 'Cancelar' : 'Nueva'}
        </motion.button>
      </div>

      {/* Create form — CSS grid-rows para animación suave sin bugs de height:auto */}
      <div
        className="grid transition-[grid-template-rows] duration-[240ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: showCreate ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <CreateCategoryForm type={type} onDone={() => setShowCreate(false)} />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b py-3 last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="h-8 w-8 rounded-xl animate-pulse" style={{ background: 'var(--skeleton-from)' }} />
              <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--skeleton-from)' }} />
            </div>
          ))}
        </div>
      ) : !categories.length ? (
        <p className="py-6 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin categorías. Crea una para empezar.</p>
      ) : (
        <AnimatePresence>
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              id={cat.id}
              name={cat.name}
              icon={cat.icon ?? 'ellipsis'}
              color={cat.color ?? '#d4af37'}
              isEditing={editingId === cat.id}
              onStartEdit={() => { setEditingId(cat.id); setShowCreate(false) }}
              onDone={() => setEditingId(null)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </AnimatePresence>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar categoría?"
        description={deleteDescription}
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteCategory.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
