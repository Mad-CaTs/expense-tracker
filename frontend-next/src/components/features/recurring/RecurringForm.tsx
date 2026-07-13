'use client'

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
import { useCreateRecurring } from '@/lib/hooks/useRecurring'
import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'
import type { RecurringFrequency } from '@/types'

interface RecurringFormProps {
  open: boolean
  onClose: () => void
}

function formatDateLabel(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export function RecurringForm({ open, onClose }: RecurringFormProps) {
  const activeWalletId = useFilterStore((s) => s.walletId)
  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets = [] } = useWallets()
  const createRecurring = useCreateRecurring()

  const today = new Date().toISOString().split('T')[0]

  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState(activeWalletId ? String(activeWalletId) : '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY')
  const [startDate, setStartDate] = useState(today)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const startDateObj = new Date(startDate + 'T12:00:00')

  function resetForm() {
    setCategoryId('')
    setWalletId(activeWalletId ? String(activeWalletId) : '')
    setAmount('')
    setDescription('')
    setFrequency('MONTHLY')
    setStartDate(today)
    setErrors({})
    onClose()
  }

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Requerido'
    if (!walletId) errs.walletId = 'Elige una cuenta'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (!description.trim()) errs.description = 'Requerido'
    if (!startDate) errs.startDate = 'Requerido'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await createRecurring.mutateAsync({
      categoryId: Number(categoryId),
      walletId: Number(walletId),
      amount: Number(amount),
      description: description.trim(),
      frequency,
      startDate,
    })
    resetForm()
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
              className="relative flex flex-col gap-3 rounded-[17px] p-5"
              style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
            >
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>
                Nuevo recurrente
              </p>

              {/* Description */}
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (ej. Netflix, Alquiler...)"
                className="input-wrapper h-10 w-full px-3 text-[13px]"
                style={{ color: 'var(--text-primary)', ...(errors.description ? { borderColor: 'var(--danger)' } : {}) }}
              />
              {errors.description && (
                <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.description}</p>
              )}

              {/* Category full width */}
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

              {/* Amount + Frequency */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Monto (S/)"
                  className="input-wrapper h-10 w-full px-3 text-[13px]"
                  style={{ color: 'var(--text-primary)', ...(errors.amount ? { borderColor: 'var(--danger)' } : {}) }}
                />
                <Select
                  value={frequency}
                  onValueChange={(v) => setFrequency(v as RecurringFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.amount && (
                <p className="-mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>
              )}

              {/* Date button */}
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="input-wrapper flex h-10 w-full items-center gap-2 px-3 text-[13px]"
                style={{ ...(errors.startDate ? { borderColor: 'var(--danger)' } : {}) }}
              >
                <CalendarDays size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                <span className="font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatDateLabel(startDate)}</span>
              </button>

              {/* Date wheel picker overlay */}
              {showDatePicker && (
                <>
                  <div
                    className="absolute inset-0 z-10 rounded-[17px] bg-black/60"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div
                    className="absolute inset-x-0 top-1/2 z-20 mx-4 -translate-y-1/2 rounded-[16px] border p-4"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: 'var(--text-placeholder)' }}>Fecha de inicio</p>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="rounded-full px-4 py-1.5 text-[12px] font-semibold"
                        style={{ background: 'var(--bg-hover)', color: 'var(--accent-light)' }}
                      >
                        Listo
                      </button>
                    </div>
                    <DateWheelPicker
                      value={startDateObj}
                      onChange={(d) => {
                        const y = d.getFullYear()
                        const m = String(d.getMonth() + 1).padStart(2, '0')
                        const day = String(d.getDate()).padStart(2, '0')
                        setStartDate(`${y}-${m}-${day}`)
                      }}
                      size="md"
                    />
                  </div>
                </>
              )}

              <motion.button
                onClick={handleCreate}
                disabled={createRecurring.isPending}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="h-10 w-full rounded-full text-[13px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
              >
                {createRecurring.isPending ? 'Guardando...' : 'Crear recurrente'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
