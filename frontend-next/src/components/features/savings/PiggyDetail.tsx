'use client'

import { useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

import { MenuIcons } from '@/components/features/expenses/WalletHeaderMenuIcons'
import { dayLabel } from '@/components/features/reports/usePeriodMovements'
import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { TrashIcon } from '@/components/ui/ConfirmDialog'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { usePiggyMovements } from '@/lib/hooks/usePiggyBanks'
import { formatMoney, symbolOf } from '@/lib/utils/currency'
import type { PiggyBank, PiggyMovement, PiggyMovementType } from '@/types'

import { PiggyHalo } from './PiggyHalo'
import { PiggyIcon } from './PiggyIcon'
import { percentLabel, piggyShare, shareOfWallet } from './piggyShare'
import { DepositIcon, WithdrawIcon } from './SavingsIcons'

/** `max-h-[92dvh]` del panel de Sheet menos su asa (~28px) y el margen
 *  inferior del área segura. */
const DETAIL_MAX_HEIGHT = 'calc(92dvh - 28px - env(safe-area-inset-bottom))'

/** El verde de lo guardado, con la transparencia que pide cada superficie. */
const green = (alpha: number) => `color-mix(in srgb, var(--success) ${alpha}%, transparent)`

interface PiggyDetailProps {
  piggy: PiggyBank
  walletColor?: string | null
  /** Lo que tienen las DEMÁS alcancías de la billetera. */
  othersSaved: number
  /** Saldo disponible de la billetera. */
  available: number
  currency?: string
  onBack: () => void
  onMove: (type: PiggyMovementType) => void
  onRename: () => void
  onBreak: () => void
}

function DetailTopBar({ name, onBack, onRename, onBreak }: { name: string; onBack: () => void; onRename: () => void; onBreak: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="mb-1 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver a las alcancías"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={`Acciones de ${name}`}
          aria-expanded={menuOpen}
          className="liquid-glass-ic flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
          style={{ color: 'var(--text-secondary)' }}
        >
          {/* SVG y no "···": el texto se apoya en la línea base y los puntos
              quedaban caídos respecto al centro del círculo. */}
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <g fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></g>
          </svg>
        </button>
        <AnimatePresence>
          {menuOpen && (
            <DropdownMenu
              align="right"
              items={[
                { icon: <MenuIcons.Pencil />, label: 'Renombrar', onClick: () => { setMenuOpen(false); onRename() } },
                { icon: <TrashIcon size={18} />, label: 'Romper alcancía', variant: 'danger', onClick: () => { setMenuOpen(false); onBreak() } },
              ]}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Qué parte de lo que hay en la billetera está aquí, en las otras y libre. */
function ShareBar({ piggy, others, available, name }: { piggy: number; others: number; available: number; name: string }) {
  const share = piggyShare(piggy, others, available)
  // Los anchos usan enteros que suman 100; los rótulos, el valor real, para
  // no decir "0%" de una alcancía que tiene algo.
  const saved = piggy + others
  const label = (amount: number) => percentLabel(shareOfWallet(amount, saved, available))
  const segments = [
    { pct: share.piggy, color: 'var(--success)' },
    { pct: share.others, color: green(35) },
    { pct: share.available, color: 'var(--bg-hover)' },
  ]
  return (
    <div className="mt-4">
      <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-hover)' }}>
        {segments.map((s, i) => (
          <span
            key={i}
            className="block h-full"
            style={{ width: `${s.pct}%`, background: s.color, transition: 'width var(--dur-travel) var(--ease-sys)' }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
        <span className="truncate"><b style={{ color: 'var(--text-secondary)' }}>{label(piggy)}</b> en {name}</span>
        <span><b style={{ color: 'var(--text-secondary)' }}>{label(others)}</b> otras alcancías</span>
        <span><b style={{ color: 'var(--text-secondary)' }}>{label(Math.max(0, available))}</b> disponible</span>
      </div>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="px-3 pb-2 pt-5 text-center">
      <span
        className="mx-auto mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-full"
        style={{ background: green(12), color: 'var(--success)' }}
      >
        <PiggyIcon size={26} />
      </span>
      <p className="text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>Tu primera moneda empieza aquí</p>
    </div>
  )
}

/** Historial como línea de tiempo, desde la alcancía: guardar suma, sacar resta. */
function Timeline({ movements, currency }: { movements: PiggyMovement[]; currency?: string }) {
  return (
    <div className="relative mt-2 pl-5">
      <span className="absolute bottom-3 left-[6px] top-3 w-[2px] rounded-full" style={{ background: 'var(--bg-hover)' }} aria-hidden />
      {movements.map((m) => {
        const deposit = m.type === 'DEPOSIT'
        return (
          <div key={m.id} className="relative flex items-baseline gap-3 py-2">
            <span
              className="absolute -left-[18px] top-[13px] h-[10px] w-[10px] rounded-full border-2"
              style={{ borderColor: deposit ? 'var(--success)' : 'var(--text-secondary)', background: 'var(--bg-base)' }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{deposit ? 'Guardado' : 'Sacado'}</span>
              <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>{dayLabel(m.date)}</span>
            </span>
            <span className="flex-none text-[13.5px] font-bold tabular-nums" style={{ color: deposit ? 'var(--success)' : 'var(--text-primary)' }}>
              {deposit ? '+' : '−'}{formatMoney(m.amount, currency)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Una alcancía: al centro con su halo, el monto, qué parte de la billetera
 * representa y su historial como línea de tiempo.
 */
export function PiggyDetail({ piggy, walletColor, othersSaved, available, currency, onBack, onMove, onRename, onBreak }: PiggyDetailProps) {
  const { data: movements = [], isLoading } = usePiggyMovements(piggy.id)
  const balance = Number(piggy.balance)
  const empty = balance <= 0

  return (
    /* Alto tope = el de la hoja menos su asa: así la vista nunca desborda el
       panel (que haría scroll de TODO) y el sobrante lo absorbe el historial,
       que es lo único que se desplaza. El encabezado queda quieto. */
    <div className="flex flex-col pt-1" style={{ maxHeight: DETAIL_MAX_HEIGHT }}>
      <div className="flex-none px-4">
      <DetailTopBar name={piggy.name} onBack={onBack} onRename={onRename} onBreak={onBreak} />

      <div className="text-center">
        <PiggyHalo walletColor={walletColor} className="mx-auto -mb-2 -mt-3" />
        <p className="truncate text-[16px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{piggy.name}</p>
        <p className="mt-1.5 text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {symbolOf(currency)} <AnimatedAmount value={balance} />
        </p>
      </div>

      <ShareBar piggy={balance} others={othersSaved} available={available} name={piggy.name} />

      <div className="mb-3 mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onMove('DEPOSIT')}
          className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-[14px] font-extrabold transition-transform active:scale-[0.98]"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <DepositIcon /> Guardar
        </button>
        {/* Vacía no hay nada que sacar: el botón no promete algo imposible. */}
        <button
          type="button"
          onClick={() => onMove('WITHDRAWAL')}
          disabled={empty}
          className="liquid-glass-ic flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-[14px] font-extrabold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ color: 'var(--text-primary)' }}
        >
          <WithdrawIcon /> Sacar
        </button>
      </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-5"
        style={{ overscrollBehavior: 'contain', scrollbarWidth: 'none' }}
      >
        {isLoading ? (
          <div className="mt-2 h-[46px] animate-pulse rounded-[12px]" style={{ background: 'var(--skeleton-from)' }} />
        ) : movements.length === 0 ? (
          <EmptyHistory />
        ) : (
          <Timeline movements={movements} currency={currency} />
        )}
      </div>
    </div>
  )
}
