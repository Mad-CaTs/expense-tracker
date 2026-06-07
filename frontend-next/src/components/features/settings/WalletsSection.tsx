'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Check, Plus, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCreateTransfer, useTransfers } from '@/lib/hooks/useTransfers'
import { useCreateWallet, useDeleteWallet, useUpdateWallet, useWallets } from '@/lib/hooks/useWallets'
import type { Wallet } from '@/types'

const COLOR_PRESETS = [
  '#d4af37', '#ef4444', '#3b82f6', '#22c55e',
  '#f97316', '#a855f7', '#ec4899', '#14b8a6',
]

function formatBalance(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Wallet row ────────────────────────────────────────────────────────────────
function WalletRow({
  wallet, isEditing, onStartEdit, onDone, onDelete,
}: {
  wallet: Wallet
  isEditing: boolean
  onStartEdit: () => void
  onDone: () => void
  onDelete: (id: number) => void
}) {
  const [name, setName] = useState(wallet.name)
  const [color, setColor] = useState(wallet.color ?? '#d4af37')
  const [error, setError] = useState('')
  const update = useUpdateWallet()

  useEffect(() => {
    if (isEditing) { setName(wallet.name); setColor(wallet.color ?? '#d4af37'); setError('') }
  }, [isEditing, wallet])

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    await update.mutateAsync({ id: wallet.id, data: { name: name.trim(), color } })
    onDone()
  }

  const balancePositive = wallet.balance >= 0

  return (
    <div className="border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* View */}
      <div className="flex items-center gap-3 py-3">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[10px] font-bold"
          style={{ background: `${wallet.color ?? '#d4af37'}18`, color: wallet.color ?? '#d4af37', boxShadow: `0 0 0 1px ${wallet.color ?? '#d4af37'}28` }}
        >
          {wallet.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{wallet.name}</span>
        </div>
        <span
          className="mono-amount text-[13px] font-bold flex-shrink-0"
          style={{ color: balancePositive ? 'var(--success)' : 'var(--danger)' }}
        >
          S/ {formatBalance(wallet.balance)}
        </span>
        <div className="flex gap-0.5">
          <button onClick={onStartEdit} className="icon-btn flex h-7 w-7 items-center justify-center rounded-lg" aria-label="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button onClick={() => onDelete(wallet.id)} className="icon-btn icon-btn-danger flex h-7 w-7 items-center justify-center rounded-lg" aria-label="Eliminar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit panel */}
      <div
        className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: isEditing ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mb-3 flex flex-col gap-3 rounded-[16px] border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Nombre de wallet"
              className="input-wrapper h-9 w-full px-3 text-[13px]"
              style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
            />
            {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-full transition-transform"
                  style={{
                    background: c,
                    boxShadow: color === c ? `0 0 0 2px var(--bg-card-inner), 0 0 0 3.5px ${c}` : 'none',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                  aria-label={c}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onDone}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              >
                <X size={12} /> Cancelar
              </button>
              <motion.button
                onClick={handleSave}
                disabled={update.isPending}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
              >
                <Check size={12} /> {update.isPending ? 'Guardando...' : 'Guardar'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create wallet form ────────────────────────────────────────────────────────
function CreateWalletForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState('#d4af37')
  const [error, setError] = useState('')
  const create = useCreateWallet()

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    const balance = parseFloat(initialBalance) || 0
    await create.mutateAsync({ name: name.trim(), initialBalance: balance, color })
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border p-4 mb-2 mt-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>Nueva wallet</p>

      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        placeholder="Nombre (ej: BCP, Efectivo)"
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
      />
      {error && <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

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

      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="h-6 w-6 rounded-full transition-transform"
            style={{
              background: c,
              boxShadow: color === c ? `0 0 0 2px var(--bg-subtle), 0 0 0 3.5px ${c}` : 'none',
              transform: color === c ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={c}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
        >
          <X size={12} /> Cancelar
        </button>
        <motion.button
          onClick={handleCreate}
          disabled={create.isPending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <Check size={12} /> {create.isPending ? 'Creando...' : 'Crear'}
        </motion.button>
      </div>
    </div>
  )
}

// ─── Transfer form ─────────────────────────────────────────────────────────────
function TransferForm({ wallets, onDone }: { wallets: Wallet[]; onDone: () => void }) {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const [fromId, setFromId] = useState('')
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
    <div className="flex flex-col gap-3 rounded-[16px] border p-4 mb-2 mt-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>Nueva transferencia</p>
      {error && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold" style={{ color: 'var(--text-dim)' }}>Desde</label>
          <select
            value={fromId}
            onChange={(e) => { setFromId(e.target.value); setError('') }}
            className="input-wrapper h-9 w-full px-3 text-[12px]"
            style={{ color: 'var(--text-primary)' }}
          >
            <option value="">Seleccionar</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold" style={{ color: 'var(--text-dim)' }}>Hacia</label>
          <select
            value={toId}
            onChange={(e) => { setToId(e.target.value); setError('') }}
            className="input-wrapper h-9 w-full px-3 text-[12px]"
            style={{ color: 'var(--text-primary)' }}
          >
            <option value="">Seleccionar</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Monto (S/)"
        min="0.01"
        step="0.01"
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)' }}
      />

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)' }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input-wrapper h-9 w-full px-3 text-[13px]"
        style={{ color: 'var(--text-primary)' }}
      />

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
          disabled={create.isPending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <Check size={12} /> {create.isPending ? 'Enviando...' : 'Transferir'}
        </motion.button>
      </div>
    </div>
  )
}

// ─── Transfer history ──────────────────────────────────────────────────────────
function TransferHistorySection({ wallets }: { wallets: Wallet[] }) {
  const [show, setShow] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { data } = useTransfers({ page: 0, size: 20 })

  if (!wallets.length) return null

  return (
    <div className="border-t mt-1" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => setShow(v => !v)}
          className="flex items-center gap-1.5 text-[12px] font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeftRight size={13} />
          Historial de transferencias
        </button>
        <motion.button
          onClick={() => { setShowForm(v => !v); setShow(true) }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {showForm ? <X size={11} /> : <Plus size={11} />}
          {showForm ? 'Cancelar' : 'Nueva'}
        </motion.button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-[240ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: showForm ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <TransferForm wallets={wallets} onDone={() => { setShowForm(false); setShow(true) }} />
        </div>
      </div>

      {show && data?.content.length ? (
        <div className="flex flex-col pb-2">
          {data.content.map(t => (
            <div key={t.id} className="flex items-center gap-2 border-b py-2.5 last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <ArrowLeftRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[12px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                  {t.fromWalletName} → {t.toWalletName}
                </span>
                {t.description && <span className="text-[10px] truncate" style={{ color: 'var(--text-dim)' }}>{t.description}</span>}
              </div>
              <span className="mono-amount text-[12px] font-bold flex-shrink-0" style={{ color: 'var(--accent)' }}>
                S/ {formatBalance(t.amount)}
              </span>
            </div>
          ))}
        </div>
      ) : show && (
        <p className="pb-3 text-center text-[12px]" style={{ color: 'var(--text-dim)' }}>Sin transferencias registradas</p>
      )}
    </div>
  )
}

// ─── Public section component ──────────────────────────────────────────────────
export function WalletsSection() {
  const { data: wallets, isLoading } = useWallets()
  const deleteWallet = useDeleteWallet()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const totalBalance = wallets?.reduce((s, w) => s + w.balance, 0) ?? 0

  return (
    <>
      <div className="flex items-center justify-between border-b py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {wallets?.length ?? 0} wallet{wallets?.length !== 1 ? 's' : ''}
          </p>
          {(wallets?.length ?? 0) > 0 && (
            <p className="mono-amount text-[11px] font-semibold" style={{ color: totalBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              Total S/ {formatBalance(totalBalance)}
            </p>
          )}
        </div>
        <motion.button
          onClick={() => { setShowCreate(v => !v); setEditingId(null) }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {showCreate ? <X size={11} /> : <Plus size={11} />}
          {showCreate ? 'Cancelar' : 'Nueva'}
        </motion.button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-[240ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ gridTemplateRows: showCreate ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <CreateWalletForm onDone={() => setShowCreate(false)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b py-3 last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="h-8 w-8 rounded-xl animate-pulse" style={{ background: 'var(--skeleton-from)' }} />
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--skeleton-from)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : !wallets?.length ? (
        <p className="py-6 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin wallets. Crea una para empezar.</p>
      ) : (
        <AnimatePresence>
          {wallets.map(w => (
            <WalletRow
              key={w.id}
              wallet={w}
              isEditing={editingId === w.id}
              onStartEdit={() => { setEditingId(w.id); setShowCreate(false) }}
              onDone={() => setEditingId(null)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </AnimatePresence>
      )}

      {wallets && <TransferHistorySection wallets={wallets} />}

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar wallet?"
        description="Los gastos e ingresos asociados perderán su wallet."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteWallet.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
