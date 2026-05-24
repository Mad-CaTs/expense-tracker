'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/lib/hooks/useCategories'

// ─── Available icons ───────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  'utensils', 'car', 'heart-pulse', 'film', 'home',
  'shopping-cart', 'wallet', 'zap', 'ellipsis',
]

const ICON_LABELS: Record<string, string> = {
  'utensils': 'Comida',
  'car': 'Transporte',
  'heart-pulse': 'Salud',
  'film': 'Entretenimiento',
  'home': 'Hogar',
  'shopping-cart': 'Compras',
  'wallet': 'Finanzas',
  'zap': 'Servicios',
  'ellipsis': 'Otro',
}

const COLOR_PRESETS = [
  '#d4af37', '#ef4444', '#3b82f6', '#22c55e',
  '#f97316', '#a855f7', '#ec4899', '#14b8a6',
  '#f59e0b', '#6366f1',
]

// ─── Icon SVG renderer ─────────────────────────────────────────────────────────
function CategoryIcon({ name, size = 15, color }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size, stroke: color ?? 'currentColor', fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'utensils': return <svg viewBox="0 0 24 24" {...s}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
    case 'car': return <svg viewBox="0 0 24 24" {...s}><path d="M19 17H5a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
    case 'heart-pulse': return <svg viewBox="0 0 24 24" {...s}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h5.27"/></svg>
    case 'film': return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>
    case 'home': return <svg viewBox="0 0 24 24" {...s}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>
    case 'shopping-cart': return <svg viewBox="0 0 24 24" {...s}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    case 'wallet': return <svg viewBox="0 0 24 24" {...s}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/></svg>
    case 'zap': return <svg viewBox="0 0 24 24" {...s}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    default: return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  }
}

// ─── Theme Switch ──────────────────────────────────────────────────────────────
function ThemeSwitch() {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Apariencia</p>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>Modo oscuro</p>
      </div>
      <div
        className="relative h-6 w-11 rounded-full"
        style={{ background: 'var(--accent)' }}
      >
        <span
          className="absolute top-[3px] left-[20px] flex h-[18px] w-[18px] items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </span>
      </div>
    </div>
  )
}

// ─── Category row (view + inline edit) ────────────────────────────────────────
function CategoryRow({
  id, name, icon, color,
  onDelete,
}: {
  id: number; name: string; icon: string; color: string
  onDelete: (id: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editIcon, setEditIcon] = useState(icon)
  const [editColor, setEditColor] = useState(color)
  const [error, setError] = useState('')
  const updateCategory = useUpdateCategory()

  async function handleSave() {
    if (!editName.trim()) { setError('El nombre es requerido'); return }
    await updateCategory.mutateAsync({ id, data: { name: editName.trim(), icon: editIcon, color: editColor } })
    setEditing(false)
    setError('')
  }

  function handleCancel() {
    setEditName(name)
    setEditIcon(icon)
    setEditColor(color)
    setEditing(false)
    setError('')
  }

  return (
    <motion.div
      layout
      className="border-b border-[#111] last:border-0"
    >
      {/* View row */}
      {!editing && (
        <div className="flex items-center gap-3 py-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}14`, boxShadow: `inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px ${color}20` }}
          >
            <CategoryIcon name={icon} size={14} color={color} />
          </div>
          <span className="flex-1 text-[13px] font-medium text-[#c8c6bb]">{name}</span>
          <div className="flex gap-0.5">
            <button
              onClick={() => setEditing(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#404040] transition-colors hover:bg-[#161616] hover:text-[#e8e6db]"
              aria-label="Editar"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#404040] transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
              aria-label="Eliminar"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Edit row */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 py-3">
              {/* Name input */}
              <input
                type="text"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setError('') }}
                placeholder="Nombre de categoría"
                className={`h-9 w-full rounded-xl border bg-[#141414] px-3 text-[13px] text-[#e8e6db] placeholder-[#484848] focus:outline-none focus:border-[#d4af37]/60 transition-colors ${error ? 'border-[#ef4444]' : 'border-[#242424]'}`}
              />
              {error && <p className="-mt-2 text-[11px] text-[#ef4444]">{error}</p>}

              {/* Icon picker */}
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setEditIcon(ic)}
                    title={ICON_LABELS[ic]}
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                    style={{
                      background: editIcon === ic ? `${editColor}20` : '#141414',
                      boxShadow: editIcon === ic ? `0 0 0 1.5px ${editColor}` : '0 0 0 1px #242424',
                    }}
                  >
                    <CategoryIcon name={ic} size={13} color={editIcon === ic ? editColor : '#484848'} />
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className="h-6 w-6 rounded-full transition-transform"
                    style={{
                      background: c,
                      boxShadow: editColor === c ? `0 0 0 2px #0e0e0e, 0 0 0 3.5px ${c}` : 'none',
                      transform: editColor === c ? 'scale(1.1)' : 'scale(1)',
                    }}
                    aria-label={c}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#242424] text-[12px] font-semibold text-[#606060] transition-colors hover:border-[#383838] hover:text-[#888]"
                >
                  <X size={12} /> Cancelar
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={updateCategory.isPending}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] text-[12px] font-bold text-[#080808] disabled:opacity-50"
                >
                  <Check size={12} /> {updateCategory.isPending ? 'Guardando...' : 'Guardar'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Create form ───────────────────────────────────────────────────────────────
function CreateCategoryForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('wallet')
  const [color, setColor] = useState('#d4af37')
  const [error, setError] = useState('')
  const create = useCreateCategory()

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    await create.mutateAsync({ name: name.trim(), icon, color })
    onDone()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#1c1c1c] bg-[#0a0a0a] p-4 mb-2">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#383838] uppercase">Nueva categoría</p>

        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Nombre"
          className={`h-9 w-full rounded-xl border bg-[#141414] px-3 text-[13px] text-[#e8e6db] placeholder-[#484848] focus:outline-none focus:border-[#d4af37]/60 transition-colors ${error ? 'border-[#ef4444]' : 'border-[#242424]'}`}
        />
        {error && <p className="-mt-2 text-[11px] text-[#ef4444]">{error}</p>}

        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              title={ICON_LABELS[ic]}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
              style={{
                background: icon === ic ? `${color}20` : '#141414',
                boxShadow: icon === ic ? `0 0 0 1.5px ${color}` : '0 0 0 1px #242424',
              }}
            >
              <CategoryIcon name={ic} size={13} color={icon === ic ? color : '#484848'} />
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
                boxShadow: color === c ? `0 0 0 2px #0a0a0a, 0 0 0 3.5px ${c}` : 'none',
                transform: color === c ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-label={c}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#242424] text-[12px] font-semibold text-[#606060] transition-colors hover:border-[#383838] hover:text-[#888]"
          >
            <X size={12} /> Cancelar
          </button>
          <motion.button
            onClick={handleCreate}
            disabled={create.isPending}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] text-[12px] font-bold text-[#080808] disabled:opacity-50"
          >
            <Check size={12} /> {create.isPending ? 'Creando...' : 'Crear'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Settings Section wrapper ──────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#383838] uppercase">{label}</p>
      <div
        className="rounded-[18px] border border-[#1c1c1c] bg-[#0e0e0e] px-4"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: categories, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configuración" />
      <div className="px-4">
        {/* Theme */}
        <Section label="Apariencia">
          <ThemeSwitch />
        </Section>

        {/* Categories */}
        <Section label="Categorías">
          {/* Add button row */}
          <div className="flex items-center justify-between border-b border-[#111] py-3">
            <p className="text-[13px] text-[#505050]">
              {categories?.length ?? 0} categoría{categories?.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="flex h-7 items-center gap-1.5 rounded-full bg-[#d4af37] px-3 text-[11px] font-bold text-[#080808]"
            >
              {showCreate ? <X size={11} /> : <Plus size={11} />}
              {showCreate ? 'Cancelar' : 'Nueva'}
            </button>
          </div>

          {/* Create form */}
          <AnimatePresence>
            {showCreate && (
              <div className="pt-3">
                <CreateCategoryForm onDone={() => setShowCreate(false)} />
              </div>
            )}
          </AnimatePresence>

          {/* List */}
          {isLoading ? (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-[#111] py-3 last:border-0">
                  <div className="h-8 w-8 rounded-xl bg-[#161616] animate-pulse" />
                  <div className="h-3 w-32 rounded bg-[#161616] animate-pulse" />
                </div>
              ))}
            </div>
          ) : !categories?.length ? (
            <p className="py-6 text-center text-[13px] text-[#383838]">Sin categorías. Crea una para empezar.</p>
          ) : (
            <AnimatePresence>
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  icon={cat.icon ?? 'ellipsis'}
                  color={cat.color ?? '#d4af37'}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </AnimatePresence>
          )}
        </Section>
      </div>

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar categoría?"
        description="Los gastos asociados perderán su categoría."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteCategory.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
