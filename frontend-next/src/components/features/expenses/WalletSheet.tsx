'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { useCreateWallet } from '@/lib/hooks/useWallets'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { EASE, MOTION_S } from '@/lib/utils/motion'

interface WalletSheetProps {
  onClose: () => void
}

export function WalletSheet({ onClose }: WalletSheetProps) {
  const create = useCreateWallet()
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState('#d4af37')
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    await create.mutateAsync({ name: name.trim(), initialBalance: parseFloat(initialBalance) || 0, color })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: MOTION_S.tint, ease: EASE }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: MOTION_S.layer, ease: EASE }}
        className="w-full max-w-sm overflow-hidden rounded-t-[20px] sm:max-w-md sm:rounded-[16px]"
        style={{ background: 'var(--bg-card-inner)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Nueva wallet</p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full cursor-pointer"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Nombre (ej: BCP, Efectivo)"
            className="input-wrapper h-10 w-full px-3 text-[13px]"
            style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
          />
          {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Saldo inicial (S/)
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-wrapper h-10 w-full px-3 text-[13px]"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Color
            </label>
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
                    className="h-7 w-7 rounded-full transition-transform"
                    style={{
                      background: shown,
                      boxShadow: color === c ? `0 0 0 2px var(--bg-card-inner), 0 0 0 3.5px ${shown}` : 'none',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                    aria-label={c}
                  />
                )
              })}
            </div>
          </div>

          <motion.button
            onClick={handleCreate}
            disabled={create.isPending}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: MOTION_S.press, ease: EASE }}
            className="h-11 w-full rounded-full text-[13px] font-bold disabled:opacity-50"
            style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
          >
            {create.isPending ? 'Creando...' : 'Crear wallet'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
