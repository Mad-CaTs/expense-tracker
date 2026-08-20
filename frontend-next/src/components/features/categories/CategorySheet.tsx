'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/useCategories'
import { categoryAura, categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { MOTION } from '@/lib/utils/motion'
import type { Category, CategoryType } from '@/types'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'

import { ICON_LABELS, ICON_OPTIONS } from './categoryConstants'

export interface CategorySheetProps {
  type: CategoryType
  /** Ausente: crear. Presente: editar esa categoría. */
  category?: Category
  /** Uso del mes de esa categoría, para que el preview muestre su estado real
   *  en vez de una tarjeta en cero que no se parece a la que se está editando. */
  usage?: { total: number; percentage: number }
  onClose: () => void
  /** Inmediato al crear: CategorySelector lo usa para seleccionar la nueva. */
  onCreated?: (category: Category) => void
  /** Nombre guardado, YA cerrado el sheet: para el aviso de éxito al editar. */
  onSaved?: (name: string) => void
  /** Nombre creado, YA cerrado el sheet: para el aviso de éxito al crear. */
  onDone?: (name: string) => void
  onDelete?: (id: number) => void
}

/** Tarjeta que se actualiza con lo que se está eligiendo. */
function Preview({ name, icon, color, total, percentage }: {
  name: string; icon: string; color: string
  /** Gastado en el mes: 0 al crear, lo real al editar. */
  total: number
  percentage: number
}) {
  const Icon = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.ellipsis
  const aura = categoryAura(color)
  return (
    <div
      className="relative mb-4 flex h-[132px] flex-col overflow-hidden rounded-[20px]"
      style={{ background: aura.base }}
    >
      <span className="wallet-aura aura-soft" aria-hidden>
        <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
        <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
        <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
        <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
      </span>

      {/* Sobre la aurora, --text-placeholder no contrasta: va en blanco tenue. */}
      <span className="absolute right-[13px] top-3 z-[2] text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Vista previa
      </span>

      {/* El icono va en el FLUJO, no en absolute: el bloque de abajo crece
          hacia arriba y con un nombre de dos líneas se le montaría encima.
          Círculo blanco con el icono a color, como en el grid. */}
      <span className="relative z-[1] flex flex-1 items-start px-[14px] pt-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          <Icon size={17} style={{ color: categorySwatch(color) }} strokeWidth={1.9} />
        </span>
      </span>

      <span className="relative z-[1] block px-[14px] pb-[14px] text-white">
        <span className="mb-2 block truncate text-[14.5px] font-extrabold tracking-[-0.01em]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
          {name.trim() || 'Nueva categoría'}
        </span>
        <span
          className="mono-amount block text-[20px] font-extrabold leading-none tracking-[-0.02em] tabular-nums"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}
        >
          S/{total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </span>
        <span className="mt-[11px] block h-[6px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <span
            className="block h-full rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%`, background: '#fff' }}
          />
        </span>
      </span>
    </div>
  )
}

/**
 * Alta y edición de categorías. Muestra arriba la tarjeta tal como quedará en el
 * grid: con aurora por color, elegir a ciegas y descubrir el resultado recién al
 * guardar era el punto débil del formulario anterior.
 *
 * Sin `category` funciona como creador — así lo usa CategorySelector desde el
 * formulario de gastos.
 */
export function CategorySheet({ type, category, usage, onClose, onCreated, onSaved, onDone, onDelete }: CategorySheetProps) {
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const editing = category != null

  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? 'wallet')
  const [color, setColor] = useState(category?.color ?? '#d4af37')
  const [error, setError] = useState('')

  /**
   * `sliding` cubre el recorrido del panel (entrada y salida) y apaga TODO lo
   * caro mientras dura:
   *  - el backdrop-filter, que se recalcula en cada frame sobre una superficie
   *    de este tamaño (y con el velo casi opaco ni se percibe en movimiento);
   *  - la aurora del preview, cuyos blobs combinan blur, blend y animación
   *    infinita (ver .is-sliding en globals.css).
   * Con el panel quieto ambos vuelven, que es cuando sí se ven.
   */
  const [sliding, setSliding] = useState(true)
  const [closing, setClosing] = useState(false)
  const exitTimer = useRef<number | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => {
      window.clearTimeout(t)
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    }
  }, [])

  /** El desmontaje espera a que la salida termine: sin framer, AnimatePresence
   *  no retiene el árbol y el panel desaparecería de golpe. */
  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setSliding(true)
    setClosing(true)
    exitTimer.current = window.setTimeout(onClose, MOTION.sheet)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const pending = create.isPending || update.isPending

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('El nombre es requerido'); return }
    const payload = { name: trimmed, icon, color, type }
    if (editing) {
      await update.mutateAsync({ id: category.id, data: payload })
      close()
      window.setTimeout(() => onSaved?.(trimmed), MOTION.sheet)
    } else {
      const created = await create.mutateAsync(payload)
      onCreated?.(created)
      if (!onDone) create.refresh()
      close()
      window.setTimeout(() => onDone?.(trimmed), MOTION.sheet)
    }
  }

  const heading = editing
    ? 'Editar categoría'
    : type === 'INCOME' ? 'Nueva categoría de ingreso' : 'Nueva categoría de gasto'

  const accent = categorySwatch(color)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={close}
    >
      {/* El sheet ES cristal, como las cards de la página: al abrirse se lee
          como una capa más de /categories y no como un diálogo pegado encima. */}
      <div
        className={`liquid-glass max-h-[88dvh] w-full max-w-sm select-none rounded-t-[24px] border-b-0 sm:max-w-md sm:rounded-[24px] ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-y-auto'}`}

        style={{
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-3 sm:hidden">
          <div className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="px-4 pb-5 pt-3">
          <p className="mb-3.5 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {heading}
          </p>

          <Preview name={name} icon={icon} color={color} total={usage?.total ?? 0} percentage={usage?.percentage ?? 0} />

          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Nombre
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Ej. Supermercado"
            autoComplete="off"
            className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] outline-none"
            style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
          />
          {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Ícono
          </p>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((ic) => {
              const Icon = CATEGORY_ICON_MAP[ic] ?? CATEGORY_ICON_MAP.ellipsis
              const on = icon === ic
              return (
                <motion.button
                  key={ic}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => setIcon(ic)}
                  title={ICON_LABELS[ic]}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-[13px] transition-colors${on ? '' : ' liquid-glass-ic'}`}
                  style={on ? { background: `${accent}22`, boxShadow: `0 0 0 1.5px ${accent}` } : undefined}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.9}
                    style={{
                      color: on ? accent : 'var(--text-muted)',
                      transition: 'color var(--dur-tint) var(--ease-sys)',
                    }}
                  />
                </motion.button>
              )
            })}
          </div>

          {/* Colores como fichas cuadradas, en la misma grilla que los iconos:
              el bloque se recorre de un solo barrido con el pulgar. */}
          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => {
              const shown = categorySwatch(c)
              return (
                <motion.button
                  key={c}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => setColor(c)}
                  className="h-[34px] w-[34px] cursor-pointer rounded-[12px]"
                  style={{
                    background: shown,
                    boxShadow: color === c ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${shown}` : 'none',
                  }}
                  aria-label={c}
                />
              )
            })}
          </div>

          <div className="mt-[18px] flex gap-2.5">
            {editing && onDelete && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => { onDelete(category.id); close() }}
                aria-label="Eliminar categoría"
                className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}
              >
                <Trash2 size={17} />
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={close}
              className="liquid-glass-ic h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={handleSubmit}
              disabled={pending}
              className="h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold disabled:opacity-50"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              {pending ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
