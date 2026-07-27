'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Plus, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDeleteWallet, useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'
import type { Wallet } from '@/types'
import { PhysicalWalletCard } from './PhysicalWalletCard'
import { WalletForm } from './WalletForm'
import { TransferSheet } from './TransferSheet'

export function WalletStack() {
  const router = useRouter()
  const { data: wallets, isLoading } = useWallets()
  const deleteWallet = useDeleteWallet()
  const setWalletId = useFilterStore((s) => s.setWalletId)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  function toggleExpanded(id: number) {
    const next = expandedId === id ? null : id
    setExpandedId(next)
    if (next !== null) {
      setTimeout(() => {
        cardRefs.current.get(next)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 120)
    }
  }
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Wallet | null>(null)
  const [transferFrom, setTransferFrom] = useState<number | 'global' | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [success, setSuccess] = useState<{ name: string; action: 'create' | 'edit' } | null>(null)

  const list = wallets ?? []

  function viewMovements(id: number) {
    setWalletId(id)
    router.push('/expenses')
  }

  return (
    <div>
      {/* Acciones globales */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setCreating((v) => !v); setEditing(null); setTransferFrom(null) }}
          className="flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {creating ? <X size={13} /> : <Plus size={13} />} {creating ? 'Cancelar' : 'Nueva cuenta'}
        </button>
        {list.length >= 2 && (
          <button
            onClick={() => { setTransferFrom(transferFrom === 'global' ? null : 'global'); setCreating(false) }}
            className="flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <ArrowLeftRight size={13} /> Transferir
          </button>
        )}
      </div>

      {/* Form crear */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <WalletForm onDone={() => setCreating(false)} onSaved={(name, action) => setSuccess({ name, action })} />
          </motion.div>
        )}
        {transferFrom === 'global' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <TransferSheet wallets={list} onDone={() => setTransferFrom(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pila */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[96px] rounded-[18px] animate-pulse" style={{ background: 'var(--skeleton-from)' }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="Sin cuentas" description="Crea tu primera cuenta para empezar a organizar tu dinero." />
      ) : (
        <div className="flex flex-col">
          {list.map((w, i) => (
            <div
              key={w.id}
              ref={(el) => { if (el) cardRefs.current.set(w.id, el); else cardRefs.current.delete(w.id) }}
              style={{ marginTop: i === 0 ? 0 : -10, zIndex: expandedId === w.id ? 20 : i }}
              className="relative"
            >
              {/* Editar inline */}
              {editing?.id === w.id ? (
                <div className="mb-3">
                  <WalletForm wallet={w} onDone={() => setEditing(null)} onSaved={(name, action) => { setEditing(null); setSuccess({ name, action }) }} />
                </div>
              ) : transferFrom === w.id ? (
                <div className="mb-3">
                  <TransferSheet wallets={list} presetFromId={w.id} onDone={() => setTransferFrom(null)} />
                </div>
              ) : (
                <PhysicalWalletCard
                  wallet={w}
                  expanded={expandedId === w.id}
                  backgroundUrl={w.backgroundUrl}
                  onToggle={() => toggleExpanded(w.id)}
                  onViewMovements={() => viewMovements(w.id)}
                  onTransfer={() => { setTransferFrom(w.id); setExpandedId(null) }}
                  onEdit={() => { setEditing(w); setExpandedId(null) }}
                  onDelete={() => setDeleteId(w.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar cuenta?"
        description="Los gastos e ingresos asociados perderán su cuenta."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteWallet.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      <SuccessDialog
        open={success != null}
        title={success?.action === 'create' ? 'Cuenta creada' : 'Cambios guardados'}
        description={success ? `"${success.name}" ${success.action === 'create' ? 'fue creada' : 'fue actualizada'} correctamente.` : undefined}
        onClose={() => setSuccess(null)}
      />
    </div>
  )
}
