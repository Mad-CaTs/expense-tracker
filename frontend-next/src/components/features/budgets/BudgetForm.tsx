'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCreateBudget } from '@/lib/hooks/useBudgets'
import { useCategories } from '@/lib/hooks/useCategories'
import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

interface BudgetFormProps {
  open: boolean
  categoryId: string
  onCategoryChange: (categoryId: string) => void
  onClose: () => void
  onCreated: (categoryName: string) => void
}

export function BudgetForm({ open, categoryId, onCategoryChange, onClose, onCreated }: BudgetFormProps) {
  const activeWalletId = useFilterStore((s) => s.walletId)
  const createBudget = useCreateBudget()
  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets = [] } = useWallets()

  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState(activeWalletId ? String(activeWalletId) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function resetForm() {
    onCategoryChange('')
    setAmount('')
    setWalletId(activeWalletId ? String(activeWalletId) : '')
    setErrors({})
    onClose()
  }

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Requerido'
    if (!walletId) errs.walletId = 'Elige una cuenta'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const catName = categories?.find((c) => c.id === Number(categoryId))?.name ?? ''
    await createBudget.mutateAsync({
      categoryId: Number(categoryId),
      walletId: Number(walletId),
      amount: Number(amount),
    })
    resetForm()
    onCreated(catName)
  }

  return (
    <div
      className="grid transition-[grid-template-rows] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] mb-4"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="pb-1"
        >
          <div className="rounded-[18px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
            <div
              className="flex flex-col gap-3 rounded-[17px] p-5"
              style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
            >
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>
                Nuevo presupuesto
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="col-span-2">
                  <Select value={categoryId} onValueChange={onCategoryChange}>
                    <SelectTrigger label="Categoría" error={errors.categoryId}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    Límite (S/)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-wrapper h-10 w-full px-3 text-sm"
                    style={{ color: 'var(--text-primary)', ...(errors.amount ? { borderColor: 'var(--danger)' } : {}) }}
                  />
                  {errors.amount && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}
                </div>

                {/* Cuenta (wallet) */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
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
              </div>

              <motion.button
                onClick={handleCreate}
                disabled={createBudget.isPending}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="mt-1 h-10 w-full rounded-full text-[13px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
              >
                {createBudget.isPending ? 'Guardando...' : 'Crear presupuesto'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
