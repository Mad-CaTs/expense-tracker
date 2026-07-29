'use client'

import { useMemo, useState } from 'react'

import { Search } from 'lucide-react'

import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { useCategories } from '@/lib/hooks/useCategories'
import { categoryAura } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'

import { useCategoryMovements, type CategoryMovement } from './useCategoryMovements'

/** Fecha corta de una fila: Hoy / Ayer / "7 jul". */
function movementDay(iso: string): string {
  const day = new Date(iso + 'T12:00:00')
  const today = new Date()
  const diff = Math.round((new Date(today.toDateString()).getTime() - new Date(day.toDateString()).getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return day.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function formatAmount(n: number): string {
  return `${n < 0 ? '-' : '+'}S/ ${Math.abs(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Misma fila que el detalle de billetera: icono redondo tintado, descripción
 *  con la categoría debajo, y a la derecha el monto con la fecha bajo él. */
function MovementRow({ movement, color, icon, categoryName }: { movement: CategoryMovement; color: string; icon: string; categoryName: string }) {
  const Icon = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.ellipsis
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3.5 py-[11px]">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full" style={{ background: `${color}1f` }}>
        <Icon size={16} style={{ color }} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {movement.description}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
          {categoryName}
        </span>
      </span>
      <span className="flex-none text-right">
        <span className="mono-amount block text-[13px] font-bold tracking-[-0.01em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {formatAmount(movement.amount)}
        </span>
        <time className="block text-[10.5px]" style={{ color: 'var(--text-placeholder)' }}>
          {movementDay(movement.date)}
        </time>
      </span>
    </div>
  )
}

/**
 * Movimientos de una categoría. Es la pantalla a la que lleva el toque corto
 * sobre una tarjeta del grid: /expenses es un resumen agregado y no lista
 * transacciones individuales, así que no servía como destino.
 */
export function CategoryMovementsScreen({ categoryId }: { categoryId: number }) {
  const { data: categories = [] } = useCategories()
  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId])

  const name = category?.name ?? ''
  const color = category?.color ?? '#d4af37'
  const icon = category?.icon ?? 'ellipsis'
  const type = category?.type === 'INCOME' ? 'INCOME' : 'EXPENSE'

  const { movements, isLoading } = useCategoryMovements(categoryId, name, type)
  const total = movements.reduce((s, m) => s + Math.abs(m.amount), 0)

  const [query, setQuery] = useState('')
  const visible = query.trim()
    ? movements.filter((m) => m.description.toLowerCase().includes(query.trim().toLowerCase()))
    : movements

  const aura = categoryAura(color)
  const Icon = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.ellipsis
  const { exitClass, goBack } = useSubPageExit()

  return (
    <div className={`subpage-in ${exitClass}`}>
      {/* El título es la categoría: el usuario ya sabe que está viendo
          movimientos (la card interior lo dice), lo que necesita saber es cuál. */}
      <SubPageHeader title={name || 'Movimientos'} onBack={goBack} />
      <div className="px-4 pb-8">
      {/* Identidad de la categoría, con la misma aurora de su tarjeta. */}
      {/* Sin enter-pop propio: lo aplica el contenedor de la pantalla (.subpage-in)
          y duplicarlo haría el gesto dos veces sobre el mismo elemento. */}
      <div className="relative mb-4 overflow-hidden rounded-[22px] p-[18px]" style={{ background: aura.base }}>
        <span className="wallet-aura aura-soft" aria-hidden>
          <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
          <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
          <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
          <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
        </span>
        {/* Distribución horizontal: el monto manda a la izquierda y el icono
            ancla la esquina opuesta, en vez de apilarse todo contra el borde
            izquierdo dejando media card vacía. Texto blanco: la superficie es
            de color propio en ambos temas. */}
        <div className="relative z-[1] flex items-start justify-between gap-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {type === 'INCOME' ? 'Recibido' : 'Gastado'}
            </p>
            <p className="mono-amount mt-[7px] text-[31px] font-extrabold leading-none tracking-[-0.03em] tabular-nums" style={{ color: '#fff', textShadow: '0 1px 18px rgba(0,0,0,0.25)' }}>
              <small className="mr-[5px] text-[18px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>S/</small>
              {total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[12px]" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <Icon size={20} style={{ color: '#fff' }} strokeWidth={1.9} />
          </span>
        </div>
        <div className="relative z-[1] mt-3.5">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-[5px] text-[11px] font-bold"
            style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', color: '#fff' }}
          >
            {movements.length} movimiento{movements.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Mismo bloque que el detalle de billetera: título, buscador y lista. */}
      <div className="liquid-glass rounded-[20px] px-2 pb-2 pt-[22px]">
        <div className="flex-none px-3.5 pb-1.5">
          <p className="text-[16px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Movimientos
          </p>
          <div className="liquid-glass-ic mt-3 flex items-center gap-2 rounded-2xl px-3.5" style={{ height: 42 }}>
            <Search size={16} className="flex-none" style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Buscar movimiento"
              autoComplete="off"
              className="search-input min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="mt-1.5">
          {isLoading ? (
            <div className="flex flex-col gap-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[60px] animate-pulse rounded-2xl" style={{ background: 'var(--skeleton-from)' }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12.5px]" style={{ color: 'var(--text-placeholder)' }}>
              Sin movimientos{query ? ' para esa búsqueda' : ' en esta categoría'}.
            </p>
          ) : (
            visible.map((m) => <MovementRow key={m.key} movement={m} color={color} icon={icon} categoryName={name} />)
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
