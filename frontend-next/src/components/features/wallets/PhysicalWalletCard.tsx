'use client'

import { motion } from 'framer-motion'
import { ArrowLeftRight, Pencil, TrendingDown, TrendingUp, Trash2, Wallet as WalletIcon } from 'lucide-react'

import type { Wallet } from '@/types'
import { cardGradient, cardNumber, walletGrowth } from '@/lib/utils/cardVisuals'

function formatBalance(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface PhysicalWalletCardProps {
  wallet: Wallet
  expanded: boolean
  backgroundUrl?: string | null
  onToggle: () => void
  onViewMovements: () => void
  onTransfer: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PhysicalWalletCard({
  wallet, expanded, backgroundUrl,
  onToggle, onViewMovements, onTransfer, onEdit, onDelete,
}: PhysicalWalletCardProps) {
  const color = wallet.color ?? '#d4af37'
  const balance = Number(wallet.balance)
  const growth = walletGrowth(balance, Number(wallet.initialBalance))

  const bgStyle = backgroundUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.72)), url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundImage: cardGradient(color) }

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="relative overflow-hidden rounded-[22px] cursor-pointer"
      style={{ ...bgStyle, boxShadow: expanded ? '0 18px 40px -12px rgba(0,0,0,0.55)' : '0 8px 22px -10px rgba(0,0,0,0.45)' }}
    >
      {/* Lengüeta (siempre visible) */}
      <button onClick={onToggle} className="block w-full px-5 pt-5 pb-4 text-left">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {wallet.name}
          </span>
          {growth && (
            <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums" style={{ color: growth.positive ? '#7ee0a0' : '#ff9a9a' }}>
              {growth.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {growth.positive ? '+' : ''}{growth.pct}%
            </span>
          )}
        </div>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.6)' }}>Saldo</p>
        <p className="mono-amount text-[28px] font-extrabold leading-none" style={{ color: '#fff' }}>
          S/ {formatBalance(balance)}
        </p>
      </button>

      {/* Sección desplegable: cara completa + acciones (patrón grid-rows del proyecto) */}
      <div
        className="grid transition-[grid-template-rows] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* Cara: chip + número + marca */}
          <div className="px-5 pb-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="inline-block h-6 w-8 rounded-[5px]" style={{ background: 'linear-gradient(135deg, #e8d27a, #b9952f)' }} aria-hidden />
              <div className="flex" aria-hidden>
                <span className="h-5 w-5 rounded-full" style={{ background: 'rgba(255,255,255,0.55)' }} />
                <span className="h-5 w-5 -ml-2 rounded-full" style={{ background: 'rgba(255,255,255,0.30)' }} />
              </div>
            </div>
            <p className="mono-amount mt-3 text-[15px] tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {cardNumber(wallet.id)}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 px-4 pb-4 pt-2">
            <ActionButton icon={<WalletIcon size={13} />} label="Movimientos" onClick={onViewMovements} />
            <ActionButton icon={<ArrowLeftRight size={13} />} label="Transferir" onClick={onTransfer} />
            <ActionButton icon={<Pencil size={13} />} onClick={onEdit} aria="Editar" />
            <ActionButton icon={<Trash2 size={13} />} onClick={onDelete} aria="Eliminar" danger />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ActionButton({ icon, label, onClick, aria, danger }: { icon: React.ReactNode; label?: string; onClick: () => void; aria?: string; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={aria ?? label}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold backdrop-blur-sm ${label ? 'flex-1' : 'w-9'}`}
      style={{
        background: danger ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.16)',
        color: danger ? '#ffd4d4' : '#fff',
      }}
    >
      {icon}{label}
    </button>
  )
}
