'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useCreateCategory } from '@/lib/hooks/useCategories'
import type { Category, CategoryType } from '@/types'
import { CategoryIcon } from './CategoryIcon'
import { COLOR_PRESETS, ICON_LABELS, ICON_OPTIONS } from './categoryConstants'

interface CategorySheetProps {
  type: CategoryType
  onClose: () => void
  onCreated?: (category: Category) => void
}

export function CategorySheet({ type, onClose, onCreated }: CategorySheetProps) {
  const create = useCreateCategory()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('wallet')
  const [color, setColor] = useState('#d4af37')
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    const created = await create.mutateAsync({ name: name.trim(), icon, color, type })
    onCreated?.(created)
    onClose()
  }

  const heading = type === 'INCOME' ? 'Nueva categoría de ingreso' : 'Nueva categoría de gasto'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-t-[24px] sm:max-w-md sm:rounded-[20px]"
        style={{ background: 'var(--bg-card-inner)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{heading}</p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full cursor-pointer"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Nombre"
            className="input-wrapper h-10 w-full px-3 text-[13px]"
            style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
          />
          {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Ícono
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  title={ICON_LABELS[ic]}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: icon === ic ? `${color}20` : 'var(--bg-input)',
                    boxShadow: icon === ic ? `0 0 0 1.5px ${color}` : `0 0 0 1px var(--border-default)`,
                  }}
                >
                  <CategoryIcon name={ic} size={14} color={icon === ic ? color : 'var(--text-muted)'} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform"
                  style={{
                    background: c,
                    boxShadow: color === c ? `0 0 0 2px var(--bg-card-inner), 0 0 0 3.5px ${c}` : 'none',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleCreate}
            disabled={create.isPending}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="h-11 w-full rounded-full text-[13px] font-bold disabled:opacity-50"
            style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
          >
            {create.isPending ? 'Creando...' : 'Crear categoría'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
