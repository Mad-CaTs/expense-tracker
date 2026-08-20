'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { WalletChip } from '@/components/features/reports/WalletChip'
import { MOTION } from '@/lib/utils/motion'
import type { Wallet } from '@/types'

interface WalletScopeCardProps {
  wallets: Wallet[]
  walletId: number
  onSelect: (walletId: number) => void
}

export function WalletScopeCard({ wallets, walletId, onSelect }: WalletScopeCardProps) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null)
  const exitTimer = useRef<number | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  const active = wallets.find((w) => w.id === walletId) ?? wallets[0]

  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setClosing(true)
    exitTimer.current = window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
      exitTimer.current = null
    }, MOTION.tint)
  }, [])

  useEffect(() => () => {
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
  }, [])

  useEffect(() => {
    if (!open) return
    function reposition() {
      const box = button.current?.getBoundingClientRect()
      if (box) setAnchor({ top: box.bottom + 8, right: window.innerWidth - box.right })
    }
    function onDown(e: PointerEvent) {
      const target = e.target as Node
      if (button.current?.contains(target) || menu.current?.contains(target)) return
      close()
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  function toggle() {
    if (open) return close()
    const box = button.current?.getBoundingClientRect()
    if (box) setAnchor({ top: box.bottom + 8, right: window.innerWidth - box.right })
    setOpen(true)
  }

  function pick(id: number) {
    onSelect(id)
    close()
  }

  if (!active) return null

  return (
    <div className="mx-4 mb-[18px]">
      {/* Sin caja: el saldo es la tipografía y la billetera un rótulo encima.
          El bloque de color a todo ancho que había antes era la pieza más
          pesada de la pantalla pero solo daba contexto, y competía con Gastos e
          Ingresos, que sí son el contenido. El color se conserva donde
          identifica: la mini-tarjeta. */}
      <div className="flex items-center gap-2.5">
        <WalletChip color={active.color} width={34} />
        <span
          className="min-w-0 truncate text-[11px] font-extrabold uppercase tracking-[0.12em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {active.name}
        </span>

        <motion.button
          ref={button}
          type="button"
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="liquid-glass ml-auto flex h-7 flex-none cursor-pointer items-center gap-1.5 rounded-full px-[11px] text-[11px] font-bold"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Cambiar
          <ChevronDown
            size={10}
            strokeWidth={3}
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--dur-tint) var(--ease-sys)',
            }}
          />
        </motion.button>
      </div>

      {/* Cuenta al cambiar de billetera en vez de saltar: el recorrido dice si
          el saldo sube o baja respecto al que se estaba mirando, y es lo que ya
          hacen las cifras del resto de la app. */}
      <p
        className="mono-amount mt-1 text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        S/ <AnimatedAmount value={Number(active.balance)} />
      </p>
      <p className="mt-1 text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
        Saldo disponible
      </p>

      {open && anchor && createPortal(
        <>
          {/* Desenfoca la página igual que los paneles de filtro. */}
          <div
            className="fixed inset-0 z-30"
            style={{
              backdropFilter: 'blur(14px) saturate(0.9)',
              WebkitBackdropFilter: 'blur(14px) saturate(0.9)',
              background: 'rgba(0,0,0,0.28)',
              animation: closing
                ? 'backdrop-out var(--dur-tint) var(--ease-sys) both'
                : 'backdrop-in var(--dur-layer) var(--ease-sys) both',
            }}
            aria-hidden
          />

          <div
            ref={menu}
            className={`liquid-glass z-40 rounded-[18px] p-[7px] ${closing ? 'anchor-out' : 'anchor-in'}`}
            style={{
              position: 'fixed',
              top: anchor.top,
              right: anchor.right,
              width: 238,
              maxHeight: `calc(100dvh - ${anchor.top + 16}px)`,
              overflowY: 'auto',
              backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
            }}
            role="listbox"
          >
            {wallets.map((w) => (
              <Row
                key={w.id}
                color={w.color}
                name={w.name}
                balance={Number(w.balance)}
                selected={walletId === w.id}
                onClick={() => pick(w.id)}
              />
            ))}

          </div>
        </>,
        document.body,
      )}
    </div>
  )
}

function Row({ color, name, balance, selected, onClick }: {
  color?: string
  name: string
  balance: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      role="option"
      aria-selected={selected}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-[13px] p-2 text-left"
      style={{ background: selected ? 'rgba(255,255,255,0.09)' : 'transparent' }}
    >
      <WalletChip color={color} width={38} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
          {name}
        </span>
        <span className="mono-amount mt-px block text-[10.5px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </span>
      {selected && <Check size={14} strokeWidth={2.8} className="flex-none" style={{ color: 'var(--text-primary)' }} />}
    </motion.button>
  )
}
