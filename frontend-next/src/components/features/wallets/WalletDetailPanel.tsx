'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Wallet as WalletIcon } from 'lucide-react'

import { AccessCard } from '@/components/features/shared/AccessCard'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { useCategories } from '@/lib/hooks/useCategories'
import { useRecurring } from '@/lib/hooks/useRecurring'
import { MOTION } from '@/lib/utils/motion'
import { useFilterStore } from '@/stores/filterStore'
import type { Wallet } from '@/types'

import { useWalletMovements, type WalletMovement } from './useWalletMovements'
import { WalletAccessIcon } from './WalletAccessIcon'
import { categorySwatch } from '@/lib/utils/cardVisuals'

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
  restored,
}: {
  stripRef: React.Ref<HTMLDivElement>
  slotRef: React.Ref<HTMLDivElement>
  adoptedCard: { html: string; clipPath: string } | null
  /** La adoptada nace oculta y la revela el motor del vuelo (.is-on). Al
   *  restaurar desde la URL no hay vuelo, así que se revela desde aquí. */
  restored?: boolean
}) {
  return (
    <div ref={stripRef} className="wd-strip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wd-strip-img wd-strip-bg" src={STRIP_SRC} alt="" aria-hidden decoding="async" />
      <div ref={slotRef} className="wd-card-slot">
        {adoptedCard && (
          <div
            className={`wd-static-card${restored ? ' is-on' : ''}`}
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

function MovementRow({ movement }: { movement: WalletMovement }) {
  const Icon = movement.categoryIcon ? (CATEGORY_ICON_MAP[movement.categoryIcon] ?? WalletIcon) : WalletIcon
  const color = movement.categoryColor && movement.categoryColor !== '#000000' ? movement.categoryColor : '#8a93a4'
  return (
    <div className="wd-mv-item wd-flow-el flex items-center gap-3 rounded-2xl px-3.5 py-[11px]">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full" style={{ background: `${color}1f` }}>
        <Icon size={16} style={{ color: categorySwatch(color) }} strokeWidth={1.8} />
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
        {/* --text-tertiary y no --text-placeholder: la fecha es un dato de la
            fila, y el tono de relleno no se leía sobre el cristal. */}
        <time className="block text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {movementDay(movement.date)}
        </time>
      </span>
    </div>
  )
}

export interface WalletDetailPanelProps {
  wallet: Wallet
  adoptedCard: { html: string; clipPath: string } | null
  /** true cuando el detalle se restauró desde la URL: no hubo vuelo que revelara
   *  la tarjeta adoptada, así que el panel la muestra por su cuenta. */
  restored?: boolean
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
export function WalletDetailPanel({ wallet, adoptedCard, restored, onBack, panelRef, stripRef, slotRef, onScrollElReady }: WalletDetailPanelProps) {
  const [query, setQuery] = React.useState('')
  const { movements } = useWalletMovements(wallet.id)
  const { data: categories = [] } = useCategories()
  const { data: recurring = [] } = useRecurring(wallet.id)
  const { data: budgets = [] } = useBudgets(wallet.id)

  const router = useRouter()
  const setWalletId = useFilterStore((s) => s.setWalletId)
  const [leaving, setLeaving] = React.useState(false)

  // Si la marca sobreviviera al desmontaje, al volver el cuero quedaría oculto.
  React.useEffect(() => () => document.body.classList.remove('wd-leaving'), [])

  /**
   * Navega a un listado con una salida visible: sin esto el push era
   * instantáneo y la pantalla cambiaba de golpe.
   *
   * `scoped` sincroniza el wallet en el filterStore — /budgets y /recurring
   * filtran por ahí, no por la URL, y sin fijarlo abrirían en la billetera que
   * quedó de antes en vez de la que se está viendo.
   */
  function navigate(path: string, scoped: boolean) {
    if (leaving) return
    if (scoped) setWalletId(wallet.id)
    setLeaving(true)
    // Las capas de cuero del dock viven en <body>, no en el panel: se les avisa
    // para que se desvanezcan junto con él (ver body.wd-leaving en globals.css).
    document.body.classList.add('wd-leaving')
    window.setTimeout(() => router.push(path), MOTION.layer)
  }

  const visible = query.trim()
    ? movements.filter((m) => m.description.toLowerCase().includes(query.trim().toLowerCase()))
    : movements

  return (
    <div ref={panelRef} className={`wd-panel${leaving ? ' is-leaving' : ''}${restored ? ' is-restored' : ''}`}>
      <div className="flex flex-none items-center pb-3 pt-4">
        {/* Mismo estilo que el avatar de la top-bar: liquid-glass, h-12, redondo
            y tinta neutra — no un botón de acento, es la misma pieza de chrome. */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a las billeteras"
          className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ color: 'var(--text-primary)' }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <WalletFrameStrip stripRef={stripRef} slotRef={slotRef} adoptedCard={adoptedCard} restored={restored} />

      <div className="wd-access flex flex-none flex-col pb-3">
        {/* El wd-reveal va en un wrapper, NO en el botón: si vive en el propio
            botón, su transition de entrada (0.3s) se aplica también al
            active:scale y el hundido del clic se siente lento y blando —
            distinto al de las cards estrechas. */}
        <div className="wd-reveal wd-reveal-1 flex">
          <AccessCard
            wide
            chevron
            title="Categorías"
            caption={`${categories.length} activas`}
            icon={<WalletAccessIcon name="categorias" />}
            onClick={() => navigate('/categories', false)}
          />
        </div>
        <div className="wd-reveal wd-reveal-2 flex gap-3">
          <AccessCard
            chevron
            title="Frecuentes"
            caption={`${recurring.length} activas`}
            icon={<WalletAccessIcon name="frecuentes" />}
            onClick={() => navigate('/recurring', true)}
          />
          <AccessCard
            chevron
            title="Presupuestos"
            caption={`${budgets.length} activas`}
            icon={<WalletAccessIcon name="presupuesto" />}
            onClick={() => navigate('/budgets', true)}
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
        <div ref={(el) => { if (el) onScrollElReady(el) }} className="wd-mv-scroll">
          {visible.map((m) => (
            <MovementRow key={m.key} movement={m} />
          ))}
          {visible.length === 0 && (
            <p className="px-4 py-6 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
              Sin movimientos{query ? ' para esa búsqueda' : ''}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
