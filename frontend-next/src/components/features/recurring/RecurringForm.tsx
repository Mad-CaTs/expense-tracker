'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { CalendarDays, ChevronDown } from 'lucide-react'

import { DateWheelPicker } from '@/components/ui/DateWheelPicker'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateRecurring } from '@/lib/hooks/useRecurring'
import { useWallets } from '@/lib/hooks/useWallets'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { MOTION } from '@/lib/utils/motion'
import { useFilterStore } from '@/stores/filterStore'
import type { RecurringFrequency } from '@/types'

export interface CreatedRecurring {
  description: string
  frequency: string
  startDate: string
}

interface RecurringFormProps {
  open: boolean
  onClose: () => void
  onCreated?: (summary: CreatedRecurring) => void
}

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'YEARLY', label: 'Anual' },
]

function shortDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export function RecurringForm({ open, onClose, onCreated }: RecurringFormProps) {
  const activeWalletId = useFilterStore((s) => s.walletId)
  const { data: categories = [] } = useCategories('EXPENSE')
  const { data: wallets = [] } = useWallets()
  const createRecurring = useCreateRecurring()

  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState<1 | 2>(1)

  const [stepDir, setStepDir] = useState<'fwd' | 'back'>('fwd')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY')
  const [startDate, setStartDate] = useState(today)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [sliding, setSliding] = useState(true)
  const [closing, setClosing] = useState(false)
  const exitTimer = useRef<number | null>(null)


  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => () => {
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
  }, [])

  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setSliding(true)
    setClosing(true)
    exitTimer.current = window.setTimeout(() => {
      exitTimer.current = null
      setClosing(false)
      setStep(1)
      setCategoryId('')
      setAmount('')
      setDescription('')
      setFrequency('MONTHLY')
      setStartDate(today)
      setErrors({})
      onClose()
    }, MOTION.sheet)
  }, [onClose, today])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  const wallet = wallets.find((w) => w.id === activeWalletId)
  const selected = categories.find((c) => String(c.id) === categoryId)
  const accent = categorySwatch(selected?.color ?? '#d4af37')
  const parsedAmount = Number(amount)

  /** Paso 1: lo que define el gasto. Se valida antes de dejar avanzar. */
  function validateStep1(): boolean {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'La descripción es requerida'
    if (!categoryId) errs.categoryId = 'Elige una categoría'
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) errs.amount = 'Ingresa un monto mayor a 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validateStep1()) { setStep(1); return }
    if (!activeWalletId) { setErrors({ wallet: 'No hay una billetera activa' }); return }

    await createRecurring.mutateAsync({
      categoryId: Number(categoryId),
      walletId: activeWalletId,
      amount: parsedAmount,
      description: description.trim(),
      frequency,
      startDate,
    })

    const summary = {
      description: description.trim(),
      frequency: (FREQUENCIES.find((f) => f.value === frequency)?.label ?? '').toLowerCase(),
      startDate: new Date(startDate + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }),
    }
    close()

    window.setTimeout(() => onCreated?.(summary), MOTION.sheet)
  }

  const PreviewIcon = CATEGORY_ICON_MAP[selected?.icon ?? 'ellipsis'] ?? CATEGORY_ICON_MAP.ellipsis
  const previewColor = selected?.color ?? '#8a93a4'
  const previewRow = (
    <div className="liquid-glass-ic mb-4 flex items-center gap-3 rounded-[20px] p-3.5">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px]" style={{ background: `${previewColor}1f` }}>
        <PreviewIcon size={17} style={{ color: categorySwatch(previewColor) }} strokeWidth={1.85} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {description.trim() || 'Nuevo frecuente'}
        </span>
        <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {selected?.name ?? 'Sin categoría'} · {FREQUENCIES.find((f) => f.value === frequency)?.label} · desde {shortDate(startDate)}
        </span>
      </span>
      <span className="mono-amount flex-none text-[15px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
        S/ {isNaN(parsedAmount) ? '0.00' : parsedAmount.toFixed(2)}
      </span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`liquid-glass max-h-[92dvh] w-full max-w-sm rounded-t-[24px] border-b-0 sm:max-w-md sm:rounded-[24px] ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-y-auto'}`}
        style={{
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
      >
        <div className="flex justify-center pb-1 pt-3 sm:hidden">
          <div className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="px-4 pb-5 pt-3">
          <p className="mb-3.5 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Nuevo frecuente
          </p>

          <div className="mb-3.5 flex gap-1.5">
            {[1, 2].map((n) => (
              <span
                key={n}
                className="h-[3px] flex-1 rounded-full transition-colors"
                style={{ background: step >= n ? 'var(--accent-light)' : 'var(--border-subtle)' }}
              />
            ))}
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Paso {step} de 2 · {step === 1 ? 'Qué' : 'Cuándo'}
          </p>

          {/* key por paso: sin él React reusa el nodo y la animación no vuelve
              a correr al cambiar de sección. */}
          <div key={step} className={stepDir === 'fwd' ? 'step-fwd' : 'step-back'}>
          {step === 1 ? (
            <>
              {/* La billetera viene del detalle: se muestra para no equivocarse,
                  pero no se elige. */}
              {wallet && (
                <div className="liquid-glass-ic mb-3.5 flex items-center gap-2.5 rounded-[15px] px-3.5 py-2.5">
                  <span className="h-2 w-2 flex-none rounded-full" style={{ background: categorySwatch(wallet.color ?? '#d4af37') }} />
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    En <b className="font-bold" style={{ color: 'var(--text-primary)' }}>{wallet.name}</b>
                  </span>
                </div>
              )}

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
                Descripción
              </p>
              <input
                type="text"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((x) => ({ ...x, description: '' })) }}
                placeholder="Ej. Netflix, Alquiler…"
                autoComplete="off"
                className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] outline-none"
                style={{ color: 'var(--text-primary)', ...(errors.description ? { borderColor: 'var(--danger)' } : {}) }}
              />
              {errors.description && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.description}</p>}

              <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
                Categoría
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const on = categoryId === String(c.id)
                  const color = c.color ?? '#d4af37'
                  const tint = categorySwatch(color)
                  const Icon = CATEGORY_ICON_MAP[c.icon ?? 'ellipsis'] ?? CATEGORY_ICON_MAP.ellipsis
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      onClick={() => { setCategoryId(String(c.id)); setErrors((x) => ({ ...x, categoryId: '' })) }}
                      className="flex h-10 cursor-pointer items-center gap-[7px] rounded-[13px] border px-3.5 text-[12.5px] font-bold transition-colors"
                      style={on
                        ? { background: `${color}22`, borderColor: tint, color: tint }
                        : { background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.85}
                        style={{
                          color: on ? tint : 'var(--text-muted)',
                          transition: 'color var(--dur-tint) var(--ease-sys)',
                        }}
                      />
                      {c.name}
                    </motion.button>
                  )
                })}
              </div>
              {errors.categoryId && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.categoryId}</p>}

              <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
                Monto
              </p>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((x) => ({ ...x, amount: '' })) }}
                placeholder="0.00"
                className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] outline-none"
                style={{ color: 'var(--text-primary)', ...(errors.amount ? { borderColor: 'var(--danger)' } : {}) }}
              />
              {errors.amount && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}

              <div className="mt-[18px] flex gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={close}
                  className="liquid-glass-ic h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => { if (validateStep1()) { setStepDir('fwd'); setStep(2) } }}
                  className="h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold"
                  style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
                >
                  Siguiente
                </motion.button>
              </div>
            </>
          ) : (
            <>
              {previewRow}

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
                Frecuencia
              </p>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map((f) => {
                  const on = frequency === f.value
                  return (
                    <motion.button
                      key={f.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      onClick={() => setFrequency(f.value)}
                      className="flex h-10 cursor-pointer items-center rounded-[13px] border px-4 text-[12.5px] font-bold transition-colors"
                      style={on
                        ? { background: accent, borderColor: accent, color: '#fff' }
                        : { background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
                    >
                      {f.label}
                    </motion.button>
                  )
                })}
              </div>

              <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
                Empieza
              </p>
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                aria-expanded={showDatePicker}
                className="liquid-glass-ic flex h-[46px] w-full cursor-pointer items-center gap-2.5 rounded-[16px] px-[15px] text-left text-[14px]"
                style={{
                  color: 'var(--text-primary)',
                  ...(showDatePicker ? { borderColor: 'var(--accent-light)' } : {}),
                }}
              >
                <CalendarDays size={17} style={{ color: 'var(--text-muted)' }} />
                <span className="flex-1">
                  {new Date(startDate + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--text-muted)',
                    transform: showDatePicker ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--dur-tint) var(--ease-sys)',
                  }}
                />
              </button>

              {/* DateWheelPicker es un selector embebido, no un modal. En `md`
                  ocupa 220px y empuja los botones fuera de la vista; `sm` lo
                  baja a 180px. Sin panel propio ni botón "Listo": el campo de
                  arriba ya funciona como interruptor, y otro botón competía con
                  "Crear". El wrapper fija --bg-card-inner porque los degradados
                  de desvanecido del picker se pintan con ese token, y sobre el
                  sheet no coincidían con el fondo. */}
              {/* grid-template-rows de 0fr a 1fr, el mismo recurso que usan
                  BudgetForm y BudgetCard. Animar `height: auto` con framer
                  obliga a recalcular el layout en cada frame —y acá adentro hay
                  tres columnas de rueda con scroll—, por eso se trababa. Esto
                  corre por CSS y no toca el hilo principal. */}
              <div
                className="grid transition-[grid-template-rows] duration-[300ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ gridTemplateRows: showDatePicker ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div
                    className="mt-2 overflow-hidden rounded-[16px]"
                    style={{ ['--bg-card-inner' as string]: 'var(--bg-elevated)', background: 'var(--bg-elevated)' }}
                  >
                    <DateWheelPicker
                      size="sm"
                      value={new Date(startDate + 'T12:00:00')}
                      onChange={(d) => {
                        const m = String(d.getMonth() + 1).padStart(2, '0')
                        const day = String(d.getDate()).padStart(2, '0')
                        setStartDate(`${d.getFullYear()}-${m}-${day}`)
                      }}
                    />
                  </div>
                </div>
              </div>

              {errors.wallet && <p className="mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.wallet}</p>}

              <div className="mt-[18px] flex gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => { setStepDir('back'); setStep(1) }}
                  className="liquid-glass-ic h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Atrás
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleSubmit}
                  disabled={createRecurring.isPending}
                  className="h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold disabled:opacity-50"
                  style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
                >
                  {createRecurring.isPending ? 'Creando...' : 'Crear'}
                </motion.button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

    </div>
  )
}
