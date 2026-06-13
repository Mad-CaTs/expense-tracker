'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

import { useCreateCategory } from '@/lib/hooks/useCategories'
import type { CategoryType } from '@/types'
import { CategoryIcon } from './CategoryIcon'
import { COLOR_PRESETS, ICON_LABELS, ICON_OPTIONS } from './categoryConstants'

export function CreateCategoryForm({ type, onDone }: { type: CategoryType; onDone: () => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('wallet')
  const [color, setColor] = useState('#d4af37')
  const [error, setError] = useState('')
  const create = useCreateCategory()

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    await create.mutateAsync({ name: name.trim(), icon, color, type })
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border p-4 mb-2 mt-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>Nueva categoría</p>

      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        placeholder="Nombre"
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
      />
      {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

      <div className="flex flex-wrap gap-1.5">
        {ICON_OPTIONS.map((ic) => (
          <button
            key={ic}
            onClick={() => setIcon(ic)}
            title={ICON_LABELS[ic]}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
            style={{
              background: icon === ic ? `${color}20` : 'var(--bg-input)',
              boxShadow: icon === ic ? `0 0 0 1.5px ${color}` : `0 0 0 1px var(--border-default)`,
            }}
          >
            <CategoryIcon name={ic} size={13} color={icon === ic ? color : 'var(--text-muted)'} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="h-6 w-6 rounded-full transition-transform"
            style={{
              background: c,
              boxShadow: color === c ? `0 0 0 2px var(--bg-subtle), 0 0 0 3.5px ${c}` : 'none',
              transform: color === c ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={c}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold transition-colors"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
        >
          <X size={12} /> Cancelar
        </button>
        <motion.button
          onClick={handleCreate}
          disabled={create.isPending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <Check size={12} /> {create.isPending ? 'Creando...' : 'Crear'}
        </motion.button>
      </div>
    </div>
  )
}
