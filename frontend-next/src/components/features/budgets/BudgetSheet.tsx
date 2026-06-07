'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
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

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface BudgetSheetProps {
  onClose: () => void
}

export function BudgetSheet({ onClose }: BudgetSheetProps) {
  const { data: categories } = useCategories()
  const createBudget = useCreateBudget()

  const now = new Date()
  const currentYear = now.getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Requerido'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await createBudget.mutateAsync({
      categoryId: Number(categoryId),
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
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

          {/* Mes / Año */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger label="Mes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger label="Año">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
