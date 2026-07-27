'use client'

import React from 'react'
import { ArrowLeft, ChevronRight, Search, Wallet as WalletIcon } from 'lucide-react'

import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { useCategories } from '@/lib/hooks/useCategories'
import { useRecurring } from '@/lib/hooks/useRecurring'
import type { Wallet } from '@/types'

import { useWalletMovements, type WalletMovement } from './useWalletMovements'
import { WalletAccessIcon } from './WalletAccessIcon'

const STRIP_SRC = '/wallets/budget-strip.webp'

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

/** Marco-billetera: la tarjeta adoptada vive metida en su bolsillo; logo tallado. */
function WalletFrameStrip({
  stripRef,
  slotRef,
  adoptedCard,
}: {
  stripRef: React.Ref<HTMLDivElement>
  slotRef: React.Ref<HTMLDivElement>
  adoptedCard: { html: string; clipPath: string } | null
}) {
  return (
    <div ref={stripRef} className="wd-strip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wd-strip-img wd-strip-bg" src={STRIP_SRC} alt="" aria-hidden decoding="async" />
      <div ref={slotRef} className="wd-card-slot">
        {adoptedCard && (
          <div
            className="wd-static-card"
            style={{ clipPath: adoptedCard.clipPath }}
            dangerouslySetInnerHTML={{ __html: adoptedCard.html }}
          />
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wd-strip-img wd-strip-front wd-pocket-clip" src={STRIP_SRC} alt="" aria-hidden decoding="async" />
      <span className="wd-logo" aria-hidden>
        <i className="wd-logo-hl" />
        <i className="wd-logo-ink" />
        <i className="wd-logo-sh" />
      </span>
    </div>
  )
}

/** Card de acceso (Categorías / Gastos Frecuentes / Presupuesto), estilo /expenses. */
function AccessCard({
  title,
  caption,
  icon,
  iconTint,
  chevron,
  wide,
  className = '',
}: {
  title: string
  caption: string
  icon: React.ReactNode
  iconTint?: string
  chevron?: boolean
  wide?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      className={`${className} liquid-glass relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[20px] text-left transition-transform active:scale-[0.985]`}
      style={{ paddingLeft: wide ? 18 : 14, paddingRight: wide ? 18 : 14 }}
    >
      {!wide && (
        <span
          className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px]${iconTint ? '' : ' liquid-glass-ic'}`}
          style={iconTint ? { background: `${iconTint}21`, color: iconTint } : { color: 'var(--text-primary)' }}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        <span className="mt-0.5 block text-[11.5px]" style={{ color: 'var(--text-placeholder)' }}>
          {caption}
        </span>
      </span>
      {wide && (
        <span className="liquid-glass-ic flex h-10 w-10 flex-none items-center justify-center rounded-full" style={{ color: 'var(--text-primary)' }}>
          {icon}
        </span>
      )}
      {/* Chevron SOLO en la card ancha: en las estrechas no cabe sin truncar el
          título ("Presupuesto"), y el ancho del texto manda sobre el adorno. */}
      {chevron && wide && (
        <ChevronRight size={18} className="ml-1 flex-none" style={{ color: 'var(--text-muted)' }} />
      )}
    </button>
  )
}

function MovementRow({ movement }: { movement: WalletMovement }) {
  const Icon = movement.categoryIcon ? (CATEGORY_ICON_MAP[movement.categoryIcon] ?? WalletIcon) : WalletIcon
  const color = movement.categoryColor && movement.categoryColor !== '#000000' ? movement.categoryColor : '#8a93a4'
  return (
    <div className="wd-mv-item wd-flow-el flex items-center gap-3 rounded-2xl px-3.5 py-[11px]">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full" style={{ background: `${color}1f` }}>
        <Icon size={16} style={{ color }} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {movement.description}
        </span>
        <span className="mt-0.5 block text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
          {movement.categoryName}
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

export interface WalletDetailPanelProps {
  wallet: Wallet
  adoptedCard: { html: string; clipPath: string } | null
  onBack: () => void
  panelRef: React.Ref<HTMLDivElement>
  stripRef: React.Ref<HTMLDivElement>
  slotRef: React.Ref<HTMLDivElement>
  /** El contenedor con scroll interno, para engancharle el efecto de emerger. */
  onScrollElReady: (el: HTMLDivElement) => void
}

/**
 * Panel del detalle de una billetera: página ESTÁTICA (marco + accesos fijos);
 * solo la lista de movimientos scrollea, emergiendo del bolsillo del dock.
 */
export function WalletDetailPanel({ wallet, adoptedCard, onBack, panelRef, stripRef, slotRef, onScrollElReady }: WalletDetailPanelProps) {
  const [query, setQuery] = React.useState('')
  const { movements } = useWalletMovements(wallet.id)
  const { data: categories = [] } = useCategories()
  const { data: recurring = [] } = useRecurring(wallet.id)
  const { data: budgets = [] } = useBudgets(wallet.id)

  const visible = query.trim()
    ? movements.filter((m) => m.description.toLowerCase().includes(query.trim().toLowerCase()))
    : movements

  return (
    <div ref={panelRef} className="wd-panel">
      <div className="flex flex-none items-center pb-3 pt-4">
        {/* Mismo lenguaje que el avatar de la top-bar (h-12, redondo, tinta accent) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a las billeteras"
          className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <WalletFrameStrip stripRef={stripRef} slotRef={slotRef} adoptedCard={adoptedCard} />

      <div className="wd-access flex flex-none flex-col pb-3">
        <AccessCard
          wide
          chevron
          className="wd-reveal wd-reveal-1"
          title="Categorías"
          caption={`${categories.length} activas`}
          icon={<WalletAccessIcon name="categorias" />}
        />
        <div className="wd-reveal wd-reveal-2 flex gap-3">
          <AccessCard
            chevron
            title="Frecuentes"
            caption={`${recurring.length} activas`}
            icon={<WalletAccessIcon name="frecuentes" />}
          />
          <AccessCard
            chevron
            title="Presupuesto"
            caption={`${budgets.length} activas`}
            icon={<WalletAccessIcon name="presupuesto" />}
          />
        </div>
      </div>

      <div
        className="wd-reveal wd-reveal-3 liquid-glass flex min-h-0 flex-1 flex-col rounded-t-[20px] px-2 pt-[22px]"
      >
        <div className="flex-none px-3.5 pb-1.5">
          <p className="text-[16px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Movimientos
          </p>
          <div
            className="liquid-glass-ic mt-3 flex items-center gap-2 rounded-2xl px-3.5"
            style={{ height: 42 }}
          >
            <Search size={16} className="flex-none" style={{ color: 'var(--text-placeholder)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Buscar movimiento"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
        <div ref={(el) => { if (el) onScrollElReady(el) }} className="wd-mv-scroll">
          {visible.map((m) => (
            <MovementRow key={m.key} movement={m} />
          ))}
          {visible.length === 0 && (
            <p className="px-4 py-6 text-[12.5px]" style={{ color: 'var(--text-placeholder)' }}>
              Sin movimientos{query ? ' para esa búsqueda' : ''}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
