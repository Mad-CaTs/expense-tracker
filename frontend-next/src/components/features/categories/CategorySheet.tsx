'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Trash2 } from 'lucide-react'

import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/useCategories'
import { categoryAura, categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { MOTION } from '@/lib/utils/motion'
import type { Category, CategoryType } from '@/types'

import { COLOR_PRESETS, ICON_LABELS, ICON_OPTIONS } from './categoryConstants'

export interface CategorySheetProps {
  type: CategoryType
  /** Ausente: crear. Presente: editar esa categoría. */
  category?: Category
  onClose: () => void
  onCreated?: (category: Category) => void
  onSaved?: (name: string) => void
  onDelete?: (id: number) => void
}

/** Tarjeta que se actualiza con lo que se está eligiendo. */
function Preview({ name, icon, color }: { name: string; icon: string; color: string }) {
  const Icon = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.ellipsis
  const aura = categoryAura(color)
  return (
    <div
      className="relative mb-4 flex h-[110px] flex-col justify-between overflow-hidden rounded-[20px] p-[14px]"
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
      <span className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ background: 'rgba(255,255,255,0.18)' }}>
        <Icon size={15} style={{ color: '#fff' }} strokeWidth={1.9} />
      </span>
      <span className="relative z-[1] block">
        <span
          className="block truncate text-[13.5px] font-extrabold tracking-[-0.02em]"
          style={{ color: 'rgba(255,255,255,0.82)' }}
        >
          {name.trim() || 'Nueva categoría'}
        </span>
        <span
          className="mono-amount mt-0.5 block text-[17px] font-extrabold tracking-[-0.02em] tabular-nums"
          style={{ color: '#fff', textShadow: '0 1px 18px rgba(0,0,0,0.25)' }}
        >
          S/ 0
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
export function CategorySheet({ type, category, onClose, onCreated, onSaved, onDelete }: CategorySheetProps) {
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
      onSaved?.(trimmed)
    } else {
      const created = await create.mutateAsync(payload)
      onCreated?.(created)
    }
    close()
  }

  const heading = editing
    ? 'Editar categoría'
    : type === 'INCOME' ? 'Nueva categoría de ingreso' : 'Nueva categoría de gasto'

  // Tono con el que el color elegido se ve realmente en la app, para que los
  // acentos del formulario coincidan con la tarjeta resultante.
  const accent = categorySwatch(color)

  return (
    // La raíz es el motion que anima: con un <div> plano acá, AnimatePresence
    // desmontaba el árbol de golpe y el `exit` del sheet nunca corría.
    // SIN fondo ni opacidad animada. Dos motivos: una capa de color se
    // interpondría entre el sheet y la pantalla, y el backdrop-filter del sheet
    // desenfocaría ESA capa plana en vez del grid; y un ancestro con opacity < 1
    // crea un grupo de composición que anula el backdrop-filter de sus hijos.
    // El contraste con el fondo lo da la sombra proyectada del propio sheet.
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={close}
    >
      {/* El sheet ES cristal, como las cards de la página: al abrirse se lee
          como una capa más de /categories y no como un diálogo pegado encima. */}
      <div
        className={`liquid-glass max-h-[88dvh] w-full max-w-sm rounded-t-[24px] border-b-0 sm:max-w-md sm:rounded-[24px] ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-y-auto'}`}
        // Muy por encima de los 22px de .liquid-glass (calibrados para cards
        // chicas): un panel de este tamaño necesita difusión fuerte para que el
        // grid de colores detrás deje de ser reconocible.
        //
        // El blur difumina las FORMAS pero no baja el color, así que el gradiente
        // del final agrega un velo — dentro del propio sheet, porque una capa
        // externa se interpondría y anularía el desenfoque.
        //
        // La sombra ancha reemplaza al overlay: separa el sheet del fondo sin
        // interponer nada entre él y la pantalla.
        style={{
          // SIN backdrop-filter, a propósito. Con el velo en .97 solo atraviesa
          // el 3% del fondo: desenfocar eso no se percibe, pero obliga a
          // recomponer la capa en cada frame del deslizamiento. Encenderlo al
          // aterrizar (de golpe o interpolado) tampoco sirve — cualquier cambio
          // de estado a mitad de camino se nota más que el efecto que aporta.
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          // Sin `spread` y con difuminado corto: con 60px de blur y 20px de
          // expansión, la sombra proyectaba una banda oscura de ~80px que al
          // cerrar barría las tarjetas de abajo y se leía como una mancha
          // siguiendo al panel. Solo necesita despegarlo del fondo.
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

          <Preview name={name} icon={icon} color={color} />

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
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  title={ICON_LABELS[ic]}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-[13px] transition-colors${on ? '' : ' liquid-glass-ic'}`}
                  style={on ? { background: `${accent}22`, boxShadow: `0 0 0 1.5px ${accent}` } : undefined}
                >
                  <Icon size={17} style={{ color: on ? accent : 'var(--text-muted)' }} strokeWidth={1.9} />
                </button>
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
              // La ficha muestra el color ATENUADO (el que tendrá la tarjeta);
              // el valor guardado sigue siendo el hex del preset.
              const shown = categorySwatch(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-[34px] w-[34px] cursor-pointer rounded-[12px] transition-transform active:scale-90"
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
              <button
                type="button"
                onClick={() => { onDelete(category.id); close() }}
                aria-label="Eliminar categoría"
                className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
                style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}
              >
                <Trash2 size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="liquid-glass-ic h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold transition-transform active:scale-[0.97]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold transition-transform active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              {pending ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
