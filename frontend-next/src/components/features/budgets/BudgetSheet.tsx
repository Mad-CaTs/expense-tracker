'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateBudget } from '@/lib/hooks/useBudgets'
import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

interface BudgetSheetProps {
  onClose: () => void
}

export function BudgetSheet({ onClose }: BudgetSheetProps) {
  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets = [] } = useWallets()
  const createBudget = useCreateBudget()
  const activeWalletId = useFilterStore((s) => s.walletId)

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState(activeWalletId ? String(activeWalletId) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Requerido'
    if (!walletId) errs.walletId = 'Elige una cuenta'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await createBudget.mutateAsync({
      categoryId: Number(categoryId),
      walletId: Number(walletId),
      amount: Number(amount),
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-t-[24px] sm:max-w-md sm:rounded-[20px]"
        style={{ background: 'var(--bg-card-inner)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Nuevo presupuesto
          </p>
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
          {/* Categoría */}
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setErrors(e => ({ ...e, categoryId: '' })) }}>
            <SelectTrigger label="Categoría" error={errors.categoryId}>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Límite (S/)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors(err => ({ ...err, amount: '' })) }}
              placeholder="0.00"
              className="input-wrapper h-10 w-full px-3 text-sm"
              style={{ color: 'var(--text-primary)', ...(errors.amount ? { borderColor: 'var(--danger)' } : {}) }}
            />
            {errors.amount && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}
          </div>

          {/* Cuenta (wallet) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Cuenta
              </label>
              {errors.walletId && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.walletId}</p>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {wallets.map((w) => {
                const selected = walletId === w.id.toString()
                const wColor = w.color ?? '#d4af37'
                return (
                  <motion.button
                    key={w.id}
                    type="button"
                    onClick={() => { setWalletId(w.id.toString()); setErrors(e => ({ ...e, walletId: '' })) }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex shrink-0 flex-col items-start justify-between rounded-2xl px-3 py-2.5"
                    style={{
                      minWidth: '110px',
                      background: selected ? `${wColor}15` : 'var(--bg-input)',
                      boxShadow: selected ? `0 0 0 1.5px ${wColor}60` : 'none',
                    }}
                  >
                    <span className="mb-1 max-w-full truncate text-[12px] font-bold" style={{ color: selected ? wColor : 'var(--text-primary)' }}>
                      {w.name}
                    </span>
                    <span className="mono-amount text-[11px]" style={{ color: wColor }}>
                      S/ {Number(w.balance).toFixed(2)}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleCreate}
            disabled={createBudget.isPending}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="h-11 w-full rounded-full text-[13px] font-bold disabled:opacity-50"
            style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
          >
            {createBudget.isPending ? 'Guardando...' : 'Crear presupuesto'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
