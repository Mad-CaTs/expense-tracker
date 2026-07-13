'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

import { useUpdateCategory } from '@/lib/hooks/useCategories'
import { CategoryIcon } from './CategoryIcon'
import { COLOR_PRESETS, ICON_LABELS, ICON_OPTIONS } from './categoryConstants'

export function CategoryRow({
  id, name, icon, color,
  isEditing, onStartEdit, onDone,
  onDelete,
  amount, count, percentage, onNavigate,
  onSaved,
}: {
  id: number; name: string; icon: string; color: string
  isEditing: boolean
  onStartEdit: () => void
  onDone: () => void
  onDelete: (id: number) => void
  amount?: number
  count?: number
  percentage?: number
  onNavigate?: (id: number) => void
  onSaved?: (name: string) => void
}) {
  const [editName, setEditName] = useState(name)
  const [editIcon, setEditIcon] = useState(icon)
  const [editColor, setEditColor] = useState(color)
  const [error, setError] = useState('')
  const updateCategory = useUpdateCategory()

  // Sincronización legítima con props: el draft se resetea al (re)abrir edición. Remontar con
  // `key` no sirve: el panel nunca se desmonta (anima con grid-rows) y resetearía el draft
  // también al cerrar, cambiando lo que se ve durante la animación de cierre.
  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditName(name)
      setEditIcon(icon)
      setEditColor(color)
      setError('')
    }
  }, [isEditing, name, icon, color])

  async function handleSave() {
    if (!editName.trim()) { setError('El nombre es requerido'); return }
    const saved = editName.trim()
    await updateCategory.mutateAsync({ id, data: { name: saved, icon: editIcon, color: editColor } })
    onDone()
    onSaved?.(saved)
  }

  function handleCancel() {
    onDone()
  }

  const hasUsage = amount !== undefined
  const pct = Math.min(Math.max(percentage ?? 0, 0), 100)
  const navigable = !!onNavigate && !isEditing

  return (
    <div className="border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* View row */}
      <div
        role={navigable ? 'button' : undefined}
        tabIndex={navigable ? 0 : undefined}
        onClick={navigable ? () => onNavigate!(id) : undefined}
        onKeyDown={navigable ? (e) => { if (e.key === 'Enter') onNavigate!(id) } : undefined}
        className={`flex items-center gap-3 py-3 transition-colors ${navigable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-ring)] rounded-lg' : ''}`}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}14`, boxShadow: `inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px ${color}20` }}
        >
          <CategoryIcon name={icon} size={15} color={color} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{name}</span>
            {hasUsage && (
              <span className="mono-amount flex-shrink-0 text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                S/ {(amount ?? 0).toFixed(2)}
              </span>
            )}
          </div>
          {hasUsage && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: (amount ?? 0) > 0 ? 1 : 0.3 }} />
              </div>
              <span className="mono-amount flex-shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {count ?? 0} mov
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onStartEdit() }}
            className={`icon-btn flex h-7 w-7 items-center justify-center rounded-lg ${isEditing ? 'text-accent-light' : ''}`}
            aria-label="Editar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id) }}
            className="icon-btn icon-btn-danger flex h-7 w-7 items-center justify-center rounded-lg"
            aria-label="Eliminar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit panel — CSS grid-rows */}
      <div
        className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: isEditing ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mb-3 flex flex-col gap-3 rounded-[16px] border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => { setEditName(e.target.value); setError('') }}
              placeholder="Nombre de categoría"
              className="input-wrapper h-9 w-full px-3 text-[13px]"
              style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
            />
            {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setEditIcon(ic)}
                  title={ICON_LABELS[ic]}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: editIcon === ic ? `${editColor}20` : 'var(--bg-input)',
                    boxShadow: editIcon === ic ? `0 0 0 1.5px ${editColor}` : `0 0 0 1px var(--border-default)`,
                  }}
                >
                  <CategoryIcon name={ic} size={13} color={editIcon === ic ? editColor : 'var(--text-muted)'} />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditColor(c)}
                  className="h-6 w-6 rounded-full transition-transform"
                  style={{
                    background: c,
                    boxShadow: editColor === c ? `0 0 0 2px var(--bg-card-inner), 0 0 0 3.5px ${c}` : 'none',
                    transform: editColor === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold transition-colors"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              >
                <X size={12} /> Cancelar
              </button>
              <motion.button
                onClick={handleSave}
                disabled={updateCategory.isPending}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
              >
                <Check size={12} /> {updateCategory.isPending ? 'Guardando...' : 'Guardar'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
