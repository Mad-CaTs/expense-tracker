'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { BudgetCardSkeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import {
  useCreateRecurring,
  useDeleteRecurring,
  useRecurring,
  useToggleRecurring,
} from '@/lib/hooks/useRecurring'
import type { RecurringExpense, RecurringFrequency } from '@/types'

import {
  CalendarClock,
  CalendarDays,
  Car,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  ShoppingCart,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'

import { DateWheelPicker } from '@/components/ui/DateWheelPicker'

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

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  MONTHLY: 'Mensual',
  WEEKLY: 'Semanal',
  YEARLY: 'Anual',
}

function formatNextDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function RecurringCard({
  item,
  index,
  onToggle,
  onDelete,
  expanded,
  onExpandToggle,
}: {
  item: RecurringExpense
  index: number
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  expanded: boolean
  onExpandToggle: () => void
}) {
  const Icon = item.categoryIcon ? (ICON_MAP[item.categoryIcon] ?? Wallet) : Wallet
  const color = item.categoryColor ?? '#d4af37'

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        onClick={onExpandToggle}
        className={`w-full cursor-pointer transition-colors duration-150 ${!item.active ? 'opacity-50' : ''}`}
        style={{ background: expanded ? 'var(--bg-hover)' : 'transparent' }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="flex-shrink-0"
          >
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </motion.div>

          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}14`, boxShadow: `0 0 0 1px ${color}18` }}
          >
            <Icon size={14} style={{ color }} strokeWidth={1.6} />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {item.description}
            </p>
            <span
              className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide"
              style={{ background: `${color}18`, color }}
            >
              {FREQUENCY_LABELS[item.frequency]}
            </span>
            {!item.active && (
              <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase" style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                Pausado
              </span>
            )}
          </div>

          <span className="mono-amount flex-shrink-0 text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            S/ {(item.amount ?? 0).toFixed(2)}
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
          >
            <div className="space-y-3 px-4 py-3.5">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Categoría</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.categoryName}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Próximo cobro</p>
                  <div className="flex items-center gap-1">
                    <CalendarClock size={11} style={{ color: 'var(--text-muted)' }} />
                    <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formatNextDate(item.nextDate)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(item.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {item.active ? (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Pausar</>
                  ) : (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Activar</>
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function RecurringPage() {
  const { data, isLoading } = useRecurring()
  const { data: categories } = useCategories('EXPENSE')
  const createRecurring = useCreateRecurring()
  const toggleRecurring = useToggleRecurring()
  const deleteRecurring = useDeleteRecurring()

  const today = new Date().toISOString().split('T')[0]

  const [showForm, setShowForm] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY')
  const [startDate, setStartDate] = useState(today)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const startDateObj = new Date(startDate + 'T12:00:00')

  function formatDateLabel(d: string) {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  function resetForm() {
    setCategoryId('')
    setAmount('')
    setDescription('')
    setFrequency('MONTHLY')
    setStartDate(today)
    setErrors({})
    setShowForm(false)
  }

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Requerido'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (!description.trim()) errs.description = 'Requerido'
    if (!startDate) errs.startDate = 'Requerido'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await createRecurring.mutateAsync({
      categoryId: Number(categoryId),
      amount: Number(amount),
      description: description.trim(),
      frequency,
      startDate,
    })
    resetForm()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Recurrentes"
        action={
          <motion.button
            onClick={() => setShowForm((v) => !v)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold"
            style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
          >
            {showForm ? <X size={12} /> : <Plus size={12} />}
            {showForm ? 'Cancelar' : 'Nuevo'}
          </motion.button>
        }
      />
      <div className="px-4">
      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar este recurrente?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteRecurring.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Create form */}
      <div
        className="grid transition-[grid-template-rows] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] mb-4"
        style={{ gridTemplateRows: showForm ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showForm ? 1 : 0 }}
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

      {/* Info */}
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--accent-bg)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--accent-light)' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Los gastos se registran <span style={{ color: 'var(--text-secondary)' }}>automáticamente</span> cada día según su frecuencia.
        </p>
      </div>

      {/* List */}
      <div className="mt-3">
        {isLoading ? (
          <div className="overflow-hidden rounded-[18px] border" style={{ borderColor: 'var(--border-subtle)' }}>
            {Array.from({ length: 3 }).map((_, i) => <BudgetCardSkeleton key={i} />)}
          </div>
        ) : !data?.length ? (
          <EmptyState
            title="Sin gastos recurrentes"
            description="Crea un recurrente para suscripciones o gastos fijos como alquiler."
          />
        ) : (
          <div
            className="overflow-hidden rounded-[18px] border divide-y divide-[var(--border-subtle)]"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}
          >
            {data.map((item, i) => (
              <div key={item.id}>
                <RecurringCard
                  item={item}
                  index={i}
                  onToggle={(id) => toggleRecurring.mutate(id)}
                  onDelete={(id) => setDeleteId(id)}
                  expanded={expandedId === item.id}
                  onExpandToggle={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
