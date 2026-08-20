'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Paperclip, Search, Wallet as WalletIcon } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

import { AttachmentsModal } from '@/components/features/expenses/AttachmentsModal'
import { AccessCard } from '@/components/features/shared/AccessCard'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { useRecurring } from '@/lib/hooks/useRecurring'
import { MOTION } from '@/lib/utils/motion'
import { useFilterStore } from '@/stores/filterStore'
import { useSheetStore } from '@/stores/sheetStore'
import type { Wallet } from '@/types'

import { useWalletMovements, type WalletMovement } from './useWalletMovements'
import { WalletAccessIcon } from './WalletAccessIcon'
import { categorySwatch } from '@/lib/utils/cardVisuals'

const STRIP_SRC = '/wallets/budget-strip.webp'

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="m14.363 5.652l1.48-1.48a2 2 0 0 1 2.829 0l1.414 1.414a2 2 0 0 1 0 2.828l-1.48 1.48zm-1.414 1.414l-8.75 8.75a1 1 0 0 0-.263.464l-1.06 4.242a.5.5 0 0 0 .606.606l4.242-1.06a1 1 0 0 0 .464-.264l8.75-8.75z" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877" />
      <path fill="currentColor" fillRule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.04-.433.409-.75.82-.707" clipRule="evenodd" />
      <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.315-2.865c-.466-.5-1.256-.5-2.837-.5H8.22c-1.58 0-2.371 0-2.836.5c-.466.5-.416 1.288-.315 2.865l.266 4.188c.185 2.906.277 4.36 1.182 5.245S8.813 22 11.596 22" opacity=".5" />
    </svg>
  )
}

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

function WalletFrameStrip({
  stripRef,
  slotRef,
  adoptedCard,
  restored,
}: {
  stripRef: React.Ref<HTMLDivElement>
  slotRef: React.Ref<HTMLDivElement>
  adoptedCard: { html: string; clipPath: string } | null
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

/**
 * Fila de movimiento del detalle de billetera.
 *
 * Se toca para editar y muestra el clip de adjuntos, igual que en /reports: es
 * la misma lista de movimientos en otra pantalla, y antes acá no hacía nada.
 */
function MovementRow({ movement }: { movement: WalletMovement }) {
  const openSheet = useSheetStore((s) => s.open)
  const [showAttachments, setShowAttachments] = useState(false)
  const Icon = movement.categoryIcon ? (CATEGORY_ICON_MAP[movement.categoryIcon] ?? WalletIcon) : WalletIcon
  const color = movement.categoryColor && movement.categoryColor !== '#000000' ? movement.categoryColor : '#8a93a4'
  return (
    <>
    <button
      type="button"
      onClick={() => openSheet(movement.kind === 'expense'
        ? { kind: 'expense-form', id: movement.id }
        : { kind: 'income-form', id: movement.id })}
      className="wd-mv-item wd-flow-el flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-[11px] text-left transition-transform active:scale-[0.99]">
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
      {/* `span` con rol y no `button`: la fila entera ya es un botón, y anidar
          botones es HTML inválido. */}
      {(movement.attachmentCount ?? 0) > 0 && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Ver ${movement.attachmentCount} adjunto(s) de ${movement.description}`}
          onClick={(e) => { e.stopPropagation(); setShowAttachments(true) }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return
            e.preventDefault()
            e.stopPropagation()
            setShowAttachments(true)
          }}
          className="flex flex-none cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-[10.5px] font-bold"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
        >
          <Paperclip size={11} strokeWidth={2.2} />
          {movement.attachmentCount}
        </span>
      )}

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
    </button>

      {/* Fuera del botón: el visor trae los suyos (cerrar, descargar). */}
      <AnimatePresence>
        {showAttachments && (
          <AttachmentsModal
            expenseId={movement.id}
            description={movement.description}
            onClose={() => setShowAttachments(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export interface WalletDetailPanelProps {
  wallet: Wallet
  adoptedCard: { html: string; clipPath: string } | null
  restored?: boolean
  onBack: () => void
  onDelete: () => void
  panelRef: React.Ref<HTMLDivElement>
  stripRef: React.Ref<HTMLDivElement>
  slotRef: React.Ref<HTMLDivElement>
  onScrollElReady: (el: HTMLDivElement) => void
}

export function WalletDetailPanel({ wallet, adoptedCard, restored, onBack, onDelete, panelRef, stripRef, slotRef, onScrollElReady }: WalletDetailPanelProps) {
  const [query, setQuery] = React.useState('')
  const { movements } = useWalletMovements(wallet.id)
  const { data: recurring = [] } = useRecurring(wallet.id)
  const { data: budgets = [] } = useBudgets(wallet.id)

  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  const setWalletId = useFilterStore((s) => s.setWalletId)
  const [leaving, setLeaving] = React.useState(false)

  React.useEffect(() => () => document.body.classList.remove('wd-leaving'), [])

  function navigate(path: string, scoped: boolean) {
    if (leaving) return
    if (scoped) setWalletId(wallet.id)
    setLeaving(true)
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

        {/* Las acciones viven acá y no en el carrusel: operan sobre ESTA
            billetera, y solo teniéndola abierta está claro cuál. */}
        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`Acciones de ${wallet.name}`}
            aria-expanded={menuOpen}
            className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            {/* Tres puntos verticales: dibujados acá porque son chrome del
                botón, no un ícono de dominio. */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <g fill="currentColor">
                <circle cx="12" cy="5" r="1.9" />
                <circle cx="12" cy="12" r="1.9" />
                <circle cx="12" cy="19" r="1.9" />
              </g>
            </svg>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <DropdownMenu
                align="right"
                items={[
                  {
                    icon: <PencilIcon />,
                    label: 'Editar',
                    onClick: () => { setMenuOpen(false); navigate(`/wallets/${wallet.id}/edit`, false) },
                  },
                  {
                    icon: <TrashIcon />,
                    label: 'Eliminar',
                    variant: 'danger',
                    onClick: () => { setMenuOpen(false); onDelete() },
                  },
                ]}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <WalletFrameStrip stripRef={stripRef} slotRef={slotRef} adoptedCard={adoptedCard} restored={restored} />

      <div className="wd-access flex flex-none flex-col pb-3">
        {/* El wd-reveal va en un wrapper, NO en el botón: si vive en el propio
            botón, su transition de entrada (0.3s) se aplica también al
            active:scale y el hundido del clic se siente lento y blando —
            distinto al de las cards estrechas. */}
        {/* Sin Categorías: son del usuario, no de la billetera, y acá
            prometían una configuración por billetera que no existe. Viven en
            Configuración. Frecuentes y Presupuestos sí son por billetera. */}
        <div className="wd-reveal wd-reveal-1 flex gap-3">
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
        className="wd-reveal wd-reveal-2 liquid-glass flex min-h-0 flex-1 flex-col rounded-t-[20px] px-2 pt-[22px]"
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
