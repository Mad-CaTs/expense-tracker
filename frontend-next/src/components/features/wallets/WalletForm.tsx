'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { useCreateWallet, useUpdateWallet } from '@/lib/hooks/useWallets'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import type { Wallet } from '@/types'
import { BackgroundPicker } from './BackgroundPicker'


interface WalletFormProps {
  wallet?: Wallet            // presente → edición
  onDone: () => void
  onSaved: (name: string, action: 'create' | 'edit') => void
}

export function WalletForm({ wallet, onDone, onSaved }: WalletFormProps) {
  const editing = !!wallet
  const [name, setName] = useState(wallet?.name ?? '')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState(wallet?.color ?? '#d4af37')
  const [backgroundId, setBackgroundId] = useState<number | null>(wallet?.backgroundId ?? null)
  const [error, setError] = useState('')
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const pending = create.isPending || update.isPending

  async function handleSubmit() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    if (editing) {
      await update.mutateAsync({ id: wallet!.id, data: { name: name.trim(), color, backgroundId } })
      onDone()
      onSaved(name.trim(), 'edit')
    } else {
      const balance = parseFloat(initialBalance) || 0
      await create.mutateAsync({ name: name.trim(), initialBalance: balance, color, backgroundId })
      onDone()
      onSaved(name.trim(), 'create')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>
        {editing ? 'Editar cuenta' : 'Nueva cuenta'}
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        placeholder="Nombre (ej: BCP, Efectivo)"
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
      />
      {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

      {!editing && (
        <input
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          placeholder="Saldo inicial (S/ 0.00)"
          min="0"
          step="0.01"
          className="input-wrapper h-9 w-full px-3 text-[13px]"
          style={{ color: 'var(--text-primary)' }}
        />
      )}

      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map((c) => {
          // La ficha muestra el color ATENUADO (el que tendrá la tarjeta);
          // el valor guardado sigue siendo el hex del preset.
          const shown = categorySwatch(c)
          return (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-6 w-6 rounded-full transition-transform"
              style={{
                background: shown,
                boxShadow: color === c ? `0 0 0 2px var(--bg-subtle), 0 0 0 3.5px ${shown}` : 'none',
                transform: color === c ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-label={c}
            />
          )
        })}
      </div>

      <BackgroundPicker value={backgroundId} onChange={setBackgroundId} />

      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
        >
          <X size={12} /> Cancelar
        </button>
        <motion.button
          onClick={handleSubmit}
          disabled={pending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <Check size={12} /> {pending ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
        </motion.button>
      </div>
    </div>
  )
}
