'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

import { DateWheelPicker } from '@/components/ui/DateWheelPicker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { Expense } from '@/types'

interface ExpenseFormProps {
  expenseId?: number
}

interface FormInnerProps {
  expense?: Expense
  expenseId?: number
}

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

function formatDisplay(val: string): string {
  if (!val) return '0.00'
  const n = parseFloat(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ExpenseFormInner({ expense, expenseId }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0

  const { data: categories } = useCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState(expense?.description ?? '')
  const [rawAmount, setRawAmount] = useState(expense ? expense.amount.toString() : '')
  const [date, setDate] = useState(
    expense ? expense.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [categoryId, setCategoryId] = useState(expense ? expense.categoryId.toString() : '')
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dateObj = new Date(date + 'T12:00:00')

  function formatDateLabel(d: string) {
    const parts = d.split('-')
    if (parts.length !== 3) return d
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const MAX_AMOUNT = 999999.99

  function handleNumpad(key: string) {
    if (key === '⌫') {
      setRawAmount((prev) => prev.slice(0, -1))
      return
    }
    if (key === '.' && rawAmount.includes('.')) return
    const next = rawAmount === '0' && key !== '.' ? key : rawAmount + key
    const parts = next.split('.')
    if (parts[1] && parts[1].length > 2) return
    if (parseFloat(next) > MAX_AMOUNT) return
    setRawAmount(next)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Requerido'
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    const payload = {
      description: description.trim(),
      amount: Number(rawAmount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
    }
    if (isEdit && expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, data: payload })
    } else {
      await createExpense.mutateAsync(payload)
    }
    router.push('/expenses')
  }

  const isSubmitting = createExpense.isPending || updateExpense.isPending
  const amountNum = parseFloat(rawAmount) || 0

  return (
    <div className="relative flex flex-col">
      {/* Description */}
      <div className="px-4 py-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del gasto"
          className={`w-full rounded-xl border bg-[#141414] px-3 py-2.5 text-[14px] font-medium text-[#e8e6db] placeholder-[#484848] transition-colors focus:outline-none focus:border-[#d4af37]/60 ${
            errors.description ? 'border-[#ef4444]' : 'border-[#242424]'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-[11px] text-[#ef4444]">{errors.description}</p>
        )}
      </div>

      {/* Amount display — tap to focus hidden input for keyboard entry */}
      <div className="flex flex-col items-center py-8">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#383838] uppercase">
          Monto
        </p>
        <div className="relative" onClick={() => document.getElementById('amount-keyboard-input')?.focus()}>
          <input
            id="amount-keyboard-input"
            inputMode="decimal"
            className="absolute inset-0 h-full w-full cursor-default opacity-0"
            value={rawAmount}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || (/^\d*\.?\d{0,2}$/.test(v) && parseFloat(v) <= MAX_AMOUNT)) setRawAmount(v)
            }}
          />
          <motion.p
            key={rawAmount}
            initial={{ scale: 0.95, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.08 }}
            className={`mono-amount text-[52px] font-extrabold leading-none tracking-[-0.03em] ${
              amountNum > 0 ? 'text-[#e8e6db]' : 'text-[#2a2a2a]'
            }`}
          >
            S/ {formatDisplay(rawAmount)}
          </motion.p>
        </div>
        {errors.amount && (
          <p className="mt-2 text-[11px] text-[#ef4444]">{errors.amount}</p>
        )}
      </div>

      {/* Category + Date row */}
      <div className="grid grid-cols-2 gap-2 border-t border-[#161616] px-4 py-3">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger error={errors.categoryId}>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-[#161616] px-3 text-sm text-[#e2e0d5] transition-colors ${
            errors.date ? 'border-[#ef4444]' : 'border-transparent hover:border-[#2a2a2a]'
          }`}
        >
          <CalendarDays size={14} className="shrink-0 text-[#484848]" />
          <span className="font-medium tabular-nums">{formatDateLabel(date)}</span>
        </button>
      </div>

      {/* Date wheel picker — absolute modal floating over the form */}
      {showDatePicker && (
        <>
          <div
            className="absolute inset-0 z-10 rounded-[19px] bg-black/60"
            onClick={() => setShowDatePicker(false)}
          />
          <div className="absolute inset-x-0 top-1/2 z-20 mx-4 -translate-y-1/2 rounded-[20px] border border-[#1c1c1c] bg-[#0a0a0a] p-[1px]">
            <div className="rounded-[19px] bg-[#0e0e0e] px-4 pb-5 pt-4" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#383838] uppercase">Fecha</p>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-[12px] font-semibold text-[#d4af37]"
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
          </div>
        </>
      )}

      {/* Notes */}
      <div className="border-t border-[#161616] px-4 py-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nota o comercio (opcional)"
          className="w-full rounded-xl border border-[#242424] bg-[#141414] px-3 py-2.5 text-[13px] text-[#808080] placeholder-[#484848] transition-colors focus:border-[#d4af37]/60 focus:outline-none"
        />
      </div>

      {/* Numpad */}
      <div className="border-t border-[#161616] px-2 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-1.5">
          {NUMPAD.map((key) => (
            <motion.button
              key={key}
              type="button"
              onClick={() => handleNumpad(key)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-colors ${
                key === '⌫'
                  ? 'text-[#888] active:bg-[#1a1a1a]'
                  : 'bg-[#141414] text-[#e8e6db] hover:bg-[#1c1c1c] active:bg-[#222]'
              }`}
            >
              {key}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-[#161616] px-4 py-4">
        <button
          type="button"
          onClick={() => router.push('/expenses')}
          className="h-12 rounded-full border border-[#242424] text-[13px] font-semibold text-[#808080] transition-colors hover:border-[#383838] hover:text-[#e8e6db]"
        >
          Cancelar
        </button>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-12 rounded-full bg-[#d4af37] text-[13px] font-bold text-[#080808] disabled:opacity-50"
        >
          {isSubmitting ? '...' : isEdit ? 'Actualizar' : 'Registrar'}
        </motion.button>
      </div>
    </div>
  )
}

export function ExpenseForm({ expenseId }: ExpenseFormProps) {
  const isEdit = expenseId != null && expenseId > 0
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm text-[#555]">Cargando...</div>
  }

  return <ExpenseFormInner key={expense?.id ?? 'new'} expense={expense} expenseId={expenseId} />
}
