'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Car,
  CheckCircle,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  Plus,
  ShoppingCart,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'

import { AttachmentSection, type PendingFile } from '@/components/features/expenses/AttachmentSection'
import { CategorySheet } from '@/components/features/categories/CategorySheet'
import { DateWheelPicker } from '@/components/ui/DateWheelPicker'
import { uploadAttachment } from '@/lib/api/attachments'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { useWallets } from '@/lib/hooks/useWallets'
import { Expense } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'heart-pulse': HeartPulse,
  film: Film,
  home: Home,
  ellipsis: Ellipsis,
  'shopping-cart': ShoppingCart,
  wallet: Wallet,
  zap: Zap,
}

interface ExpenseFormProps {
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

interface FormInnerProps {
  expense?: Expense
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

function formatDisplay(val: string): string {
  if (!val) return '0.00'
  const n = parseFloat(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ExpenseFormInner({ expense, expenseId, onDone, onRequestDelete }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0
  const embedded = onDone != null

  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets } = useWallets()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState(expense?.description ?? '')
  const [rawAmount, setRawAmount] = useState(expense ? expense.amount.toString() : '')
  const [date, setDate] = useState(
    expense ? expense.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [categoryId, setCategoryId] = useState(expense ? expense.categoryId.toString() : '')
  const [walletId, setWalletId] = useState(expense?.walletId?.toString() ?? '')
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const dateObj = new Date(date + 'T12:00:00')
  const MAX_AMOUNT = 999999.99

  function formatDateLabel(d: string) {
    const parts = d.split('-')
    if (parts.length !== 3) return d
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Requerido'
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    if (wallets && wallets.length > 0 && !walletId) errs.walletId = 'Selecciona un wallet'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      description: description.trim(),
      amount: Number(rawAmount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
      walletId: walletId ? Number(walletId) : undefined,
    }
    if (isEdit && expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, data: payload })
      await Promise.all(pendingFiles.map(p => uploadAttachment(expenseId, p.file)))
    } else {
      await createExpense.mutateAsync(payload)
    }
    setPendingFiles([])
    if (onDone) onDone()
    else router.push('/expenses')
  }

  const isSubmitting = createExpense.isPending || updateExpense.isPending
  const amountNum = parseFloat(rawAmount) || 0

  return (
    <div className={`relative flex flex-col ${embedded ? 'pb-4' : 'pb-28'}`}>

      {/* Description */}
      <div className="px-4 pt-4 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Descripción
          </p>
          {errors.description && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.description}</p>
          )}
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors(e => ({ ...e, description: '' })) }}
          placeholder="¿En qué gastaste?"
          className="input-borderless w-full px-3 py-2.5 text-[14px] font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center py-8">
        <div className="mb-1 flex items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Monto del gasto
          </p>
          {errors.amount && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>
          )}
        </div>
        <div className="relative" onClick={() => document.getElementById('amount-keyboard-input')?.focus()}>
          <input
            id="amount-keyboard-input"
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
            style={{ color: amountNum > 0 ? 'var(--danger)' : 'var(--border-strong)' }}
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

      {/* Category grid */}
      <div className="pt-2 pb-2">
        <div className="mx-4 mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
        <div className="mb-3 flex items-center justify-between px-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Categoría
          </p>
          {errors.categoryId && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.categoryId}</p>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
          <div className="shrink-0 pl-4" />
          {categories?.map((cat) => {
            const Icon = cat.icon ? (ICON_MAP[cat.icon] ?? Wallet) : Wallet
            const color = cat.color ?? '#d4af37'
            const selected = categoryId === cat.id.toString()
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => { setCategoryId(cat.id.toString()); setErrors(e => ({ ...e, categoryId: '' })) }}
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
          placeholder="Comercio, referencia... (opcional)"
          rows={3}
          className="input-borderless w-full resize-none px-3 py-3 text-[13px] outline-none"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Attachments — solo en edición */}
      {isEdit && expenseId && (
        <AttachmentSection
          expenseId={expenseId}
          pendingFiles={pendingFiles}
          onAddFiles={(files) => setPendingFiles(prev => [...prev, ...files])}
          onRemovePending={(id) => setPendingFiles(prev => prev.filter(p => p.id !== id))}
        />
      )}

      {/* Fixed action button */}
      <div
        className={embedded ? 'px-4 pt-3 pb-4' : 'fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3'}
        style={embedded ? undefined : { background: 'var(--bg-base)' }}
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
        {embedded && onRequestDelete && (
          <button
            type="button"
            onClick={onRequestDelete}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-full text-[13px] font-semibold transition-colors cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)' }}
          >
            Eliminar registro
          </button>
        )}
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
              <div
                className="rounded-[19px] px-4 pb-5 pt-4"
                style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
              >
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
            type="EXPENSE"
            onClose={() => setShowCategorySheet(false)}
            onCreated={(cat) => { setCategoryId(cat.id.toString()); setErrors(e => ({ ...e, categoryId: '' })) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export function ExpenseForm({ expenseId, onDone, onRequestDelete }: ExpenseFormProps) {
  const isEdit = expenseId != null && expenseId > 0
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <ExpenseFormInner
      key={expense?.id ?? 'new'}
      expense={expense}
      expenseId={expenseId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
    />
  )
}
