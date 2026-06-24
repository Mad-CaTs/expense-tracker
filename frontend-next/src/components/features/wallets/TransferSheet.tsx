'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

import { useCreateTransfer } from '@/lib/hooks/useTransfers'
import type { Wallet } from '@/types'

interface TransferSheetProps {
  wallets: Wallet[]
  presetFromId?: number
  onDone: () => void
}

export function TransferSheet({ wallets, presetFromId, onDone }: TransferSheetProps) {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const [fromId, setFromId] = useState(presetFromId ? String(presetFromId) : '')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayStr)
  const [error, setError] = useState('')
  const create = useCreateTransfer()

  async function handleSubmit() {
    if (!fromId || !toId) { setError('Selecciona origen y destino'); return }
    if (fromId === toId) { setError('Origen y destino no pueden ser iguales'); return }
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Monto inválido'); return }
    await create.mutateAsync({ fromWalletId: Number(fromId), toWalletId: Number(toId), amount: amt, description: description.trim() || undefined, date })
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>Nueva transferencia</p>
      {error && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold" style={{ color: 'var(--text-dim)' }}>Desde</label>
          <select value={fromId} onChange={(e) => { setFromId(e.target.value); setError('') }} className="input-wrapper h-9 w-full px-3 text-[12px]" style={{ color: 'var(--text-primary)' }}>
            <option value="">Seleccionar</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold" style={{ color: 'var(--text-dim)' }}>Hacia</label>
          <select value={toId} onChange={(e) => { setToId(e.target.value); setError('') }} className="input-wrapper h-9 w-full px-3 text-[12px]" style={{ color: 'var(--text-primary)' }}>
            <option value="">Seleccionar</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto (S/)" min="0.01" step="0.01" className="input-wrapper h-9 w-full px-3 text-[13px]" style={{ color: 'var(--text-primary)' }} />
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="input-wrapper h-9 w-full px-3 text-[13px]" style={{ color: 'var(--text-primary)' }} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-wrapper h-9 w-full px-3 text-[13px]" style={{ color: 'var(--text-primary)' }} />

      <div className="flex gap-2">
        <button onClick={onDone} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <X size={12} /> Cancelar
        </button>
        <motion.button onClick={handleSubmit} disabled={create.isPending} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50" style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}>
          <Check size={12} /> {create.isPending ? 'Enviando...' : 'Transferir'}
        </motion.button>
      </div>
    </div>
  )
}
