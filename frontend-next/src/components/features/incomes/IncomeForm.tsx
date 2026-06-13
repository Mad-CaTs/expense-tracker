'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CheckCircle, Plus, Wallet } from 'lucide-react'

import { CategorySheet } from '@/components/features/categories/CategorySheet'
import { DateWheelPicker } from '@/components/ui/DateWheelPicker'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateIncome, useIncome, useUpdateIncome } from '@/lib/hooks/useIncomes'
import { useWallets } from '@/lib/hooks/useWallets'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { Income } from '@/types'

interface IncomeFormProps {
  incomeId?: number
}

interface FormInnerProps {
  income?: Income
  incomeId?: number
}

function formatDisplay(val: string): string {
  if (!val) return '0.00'
  const n = parseFloat(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function IncomeFormInner({ income, incomeId }: FormInnerProps) {
  const router = useRouter()
  const isEdit = incomeId != null && incomeId > 0

  const { data: wallets } = useWallets()
  const { data: categories } = useCategories('INCOME')
  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()

  const [description, setDescription] = useState(income?.description ?? '')
  const [rawAmount, setRawAmount] = useState(income ? income.amount.toString() : '')
  const [date, setDate] = useState(
    income ? income.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [walletId, setWalletId] = useState(income?.walletId?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(income?.categoryId?.toString() ?? '')
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [notes, setNotes] = useState(income?.notes ?? '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dateObj = new Date(date + 'T12:00:00')
  const MAX_AMOUNT = 999999.99

  function formatDateLabel(d: string) {
    const parts = d.split('-')
    if (parts.length !== 3) return d
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (wallets && wallets.length > 0 && !walletId) errs.walletId = 'Selecciona un wallet'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      amount: Number(rawAmount),
      description: description.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      walletId: walletId ? Number(walletId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }
    if (isEdit && incomeId) {
      await updateIncome.mutateAsync({ id: incomeId, data: payload as Omit<Income, 'id'> })
    } else {
      await createIncome.mutateAsync(payload)
    }
    router.push('/expenses')
  }

  const isSubmitting = createIncome.isPending || updateIncome.isPending
  const amountNum = parseFloat(rawAmount) || 0

  return (
    <div className="relative flex flex-col pb-28">

      {/* Description */}
      <div className="px-4 pt-4 pb-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Descripción
        </p>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Salario, freelance, venta..."
          className="input-borderless w-full px-3 py-2.5 text-[14px] font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center py-8">
        <div className="mb-1 flex items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Monto del ingreso
          </p>
          {errors.amount && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>
          )}
        </div>
        <div className="relative" onClick={() => document.getElementById('income-amount-input')?.focus()}>
          <input
            id="income-amount-input"
            inputMode="decimal"
            type="number"
            min="0"
            max={MAX_AMOUNT}
            step="0.01"
            className="absolute inset-0 h-full w-full cursor-default opacity-0"
            value={rawAmount}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || (/^\d*\.?\d{0,2}$/.test(v) && parseFloat(v) <= MAX_AMOUNT)) {
                setRawAmount(v)
                if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
              }
            }}
          />
          <motion.p
            key={rawAmount}
            initial={{ scale: 0.95, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.08 }}
            className="mono-amount text-[52px] font-extrabold leading-none tracking-[-0.03em]"
            style={{ color: amountNum > 0 ? 'var(--success)' : 'var(--border-strong)' }}
          >
            S/ {formatDisplay(rawAmount)}
          </motion.p>
        </div>
      </div>

      {/* Date */}
      <div className="px-4 pt-2 pb-3">
        <div className="mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Fecha
        </p>
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
        >
          <CalendarDays size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono">{formatDateLabel(date)}</span>
        </button>
      </div>

      {/* Category grid (opcional) */}
      {categories && categories.length > 0 && (
        <div className="pt-2 pb-2">
          <div className="mx-4 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
          <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Categoría
          </p>
          <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
            <div className="shrink-0 pl-4" />
            {categories.map((cat) => {
              const Icon = cat.icon ? (CATEGORY_ICON_MAP[cat.icon] ?? Wallet) : Wallet
              const color = cat.color ?? '#d4af37'
              const selected = categoryId === cat.id.toString()
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(selected ? '' : cat.id.toString())}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-colors"
                  style={{
                    background: selected ? `${color}18` : 'var(--bg-input)',
                    boxShadow: selected ? `0 0 0 1.5px ${color}60` : 'none',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: selected ? `${color}25` : `${color}12` }}
                  >
                    <Icon size={18} style={{ color }} strokeWidth={1.7} />
                  </div>
                  <span
                    className="text-center text-[10px] font-semibold leading-tight"
                    style={{ color: selected ? color : 'var(--text-muted)' }}
                  >
                    {cat.name}
                  </span>
                </motion.button>
              )
            })}
            {/* + Nueva categoría */}
            <motion.button
              type="button"
              onClick={() => setShowCategorySheet(true)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 transition-colors"
              style={{ border: '1px dashed var(--border-strong)' }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--bg-input)' }}>
                <Plus size={18} style={{ color: 'var(--text-muted)' }} strokeWidth={1.7} />
              </div>
              <span className="text-center text-[10px] font-semibold leading-tight" style={{ color: 'var(--text-muted)' }}>
                Nueva
              </span>
            </motion.button>
            <div className="shrink-0 pr-4" />
          </div>
        </div>
      )}

      {/* Wallet cards */}
      {wallets && wallets.length > 0 && (
        <div className="pt-2 pb-2">
          <div className="mx-4 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
          <div className="mb-3 flex items-center justify-between px-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Wallet
            </p>
            {errors.walletId && (
              <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.walletId}</p>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
            <div className="shrink-0 pl-4" />
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
                  className="flex shrink-0 flex-col items-start justify-between rounded-2xl px-3 py-2.5 transition-colors"
                  style={{
                    minWidth: '110px',
                    background: selected ? `${wColor}15` : 'var(--bg-input)',
                    boxShadow: selected ? `0 0 0 1.5px ${wColor}60` : 'none',
                  }}
                >
                  <span className="mb-1 max-w-full truncate text-[12px] font-bold" style={{ color: selected ? wColor : 'var(--text-primary)' }}>
                    {w.name}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: wColor }}>
                    S/ {Number(w.balance).toFixed(2)}
                  </span>
                </motion.button>
              )
            })}
            <div className="shrink-0 pr-4" />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="px-4 pt-2 pb-3">
        <div className="mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Nota
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalles adicionales del ingreso..."
          rows={3}
          className="input-borderless w-full resize-none px-3 py-3 text-[13px] outline-none"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Fixed action button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3"
        style={{ background: 'var(--bg-base)' }}
      >
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold uppercase tracking-[0.06em] disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {!isSubmitting && <CheckCircle size={18} strokeWidth={1.7} />}
          {isSubmitting ? '...' : isEdit ? 'Actualizar registro' : 'Guardar registro'}
        </motion.button>
      </div>

      {/* Date wheel picker */}
      <AnimatePresence>
        {showDatePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setShowDatePicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 top-1/2 z-50 mx-4 -translate-y-1/2 rounded-[20px] border p-[1px]"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
            >
              <div className="rounded-[19px] px-4 pb-5 pt-4" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Fecha</p>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="rounded-full px-4 py-1.5 text-[12px] font-semibold cursor-pointer"
                    style={{ background: 'var(--bg-hover)', color: 'var(--accent-light)' }}
                  >
                    Listo
                  </button>
                </div>
                <DateWheelPicker
                  value={dateObj}
                  onChange={(d) => {
                    const y = d.getFullYear()
                    const m = String(d.getMonth() + 1).padStart(2, '0')
                    const day = String(d.getDate()).padStart(2, '0')
                    setDate(`${y}-${m}-${day}`)
                  }}
                  size="md"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category sheet — quick create */}
      <AnimatePresence>
        {showCategorySheet && (
          <CategorySheet
            type="INCOME"
            onClose={() => setShowCategorySheet(false)}
            onCreated={(cat) => setCategoryId(cat.id.toString())}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export function IncomeForm({ incomeId }: IncomeFormProps) {
  const isEdit = incomeId != null && incomeId > 0
  const { data: income, isLoading } = useIncome(incomeId ?? 0)

  if (isEdit && isLoading) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return <IncomeFormInner key={income?.id ?? 'new'} income={income} incomeId={incomeId} />
}
