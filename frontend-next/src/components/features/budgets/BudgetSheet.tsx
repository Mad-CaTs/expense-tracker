'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'

import { BudgetCategoryIcon } from '@/components/features/budgets/BudgetCategoryIcon'
import { useCategories } from '@/lib/hooks/useCategories'
import { useBudgets, useCreateBudget } from '@/lib/hooks/useBudgets'
import { useWallets } from '@/lib/hooks/useWallets'
import { categoryAura, categorySwatch } from '@/lib/utils/cardVisuals'
import { MOTION } from '@/lib/utils/motion'
import { useFilterStore } from '@/stores/filterStore'
import type { Category } from '@/types'

interface BudgetSheetProps {
  /** Categoría sugerida desde el estado vacío: llega por nombre porque es lo
   *  que expone el breakdown de reportes. */
  presetCategoryName?: string
  onClose: () => void
  /** Categoría del presupuesto creado. Sin esto la lista no se refresca:
   *  la invalidación se difiere al `refresh` de quien muestre el aviso. */
  onCreated?: (categoryName: string) => void
}

/**
 * Tarjeta tal como quedará en el grid, con lo que se está eligiendo. Un
 * presupuesto nuevo arranca sin gasto, así que la barra siempre sale vacía: lo
 * que se ve acá es la identidad —color e icono de la categoría— y el límite.
 */
function Preview({ category, limit }: { category?: Category; limit: number }) {
  const color = category?.color ?? '#d4af37'
  const aura = categoryAura(color)

  return (
    <div
      className="relative mb-4 flex h-[132px] flex-col overflow-hidden rounded-[20px]"
      style={{ background: aura.base }}
    >
      <span className="wallet-aura aura-soft" aria-hidden>
        <span className="wallet-blob b1" style={{ background: aura.blobs[0] }} />
        <span className="wallet-blob b2" style={{ background: aura.blobs[1] }} />
        <span className="wallet-blob b3" style={{ background: aura.blobs[2] }} />
        <span className="wallet-blob b4" style={{ background: aura.blobs[3] }} />
      </span>

      {/* Sobre la aurora, --text-placeholder no contrasta: va en blanco tenue. */}
      <span className="absolute right-[13px] top-3 z-[2] text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Vista previa
      </span>

      {/* El icono va en el FLUJO, no en absolute: el bloque de abajo crece
          hacia arriba y con un nombre de dos líneas —"Elige una categoría",
          antes de elegir— se le montaba encima. */}
      <span className="relative z-[1] flex flex-1 items-start px-[14px] pt-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <span style={{ color: '#fff', lineHeight: 0 }}>
            <BudgetCategoryIcon name={category?.icon} size={16} />
          </span>
        </span>
      </span>

      <span className="relative z-[1] block px-[14px] pb-[14px] text-white">
        <span className="mb-1.5 block truncate text-[13.5px] font-extrabold tracking-[-0.01em]">
          {category?.name ?? 'Elige una categoría'}
        </span>
        <span className="mono-amount block text-[19px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">
          S/0{' '}
          <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            / {limit > 0 ? limit.toFixed(0) : '—'}
          </span>
        </span>
        <span className="mt-2.5 block h-[6px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <span className="block h-full w-0 rounded-full" style={{ background: '#fff' }} />
        </span>
        <span className="mt-[7px] block text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {limit > 0 ? `S/${limit.toFixed(0)} disponibles` : 'Define un límite'}
        </span>
      </span>
    </div>
  )
}

export function BudgetSheet({ presetCategoryName, onClose, onCreated }: BudgetSheetProps) {
  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets = [] } = useWallets()
  const { data: existing = [] } = useBudgets()
  const createBudget = useCreateBudget()
  const activeWalletId = useFilterStore((s) => s.walletId)

  const [pickedCategoryId, setPickedCategoryId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')

  const walletId = String(activeWalletId ?? wallets[0]?.id ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const presetId = presetCategoryName
    ? categories?.find((c) => c.name === presetCategoryName)?.id.toString() ?? ''
    : ''
  const categoryId = pickedCategoryId ?? presetId

  const [sliding, setSliding] = useState(true)
  const [closing, setClosing] = useState(false)
  const exitTimer = useRef<number | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setSliding(false), MOTION.sheet)
    return () => {
      window.clearTimeout(t)
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    }
  }, [])

  const close = useCallback(() => {
    if (exitTimer.current !== null) return
    setSliding(true)
    setClosing(true)
    exitTimer.current = window.setTimeout(onClose, MOTION.sheet)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const selectedCategory = categories?.find((c) => String(c.id) === categoryId)

  /**
   * El backend guarda por (categoría, cuenta): repetir ese par no crea otro
   * presupuesto, le cambia el límite al que ya existe. Se avisa en vez de
   * bloquear —redefinir un límite desde acá es legítimo— pero el botón dice
   * qué va a pasar realmente.
   */
  const replaces = existing.some(
    (b) => String(b.categoryId) === categoryId && String(b.walletId) === walletId,
  )

  async function handleCreate() {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (!walletId) errs.amount = 'Crea una billetera antes de presupuestar'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await createBudget.mutateAsync({
      categoryId: Number(categoryId),
      walletId: Number(walletId),
      amount: Number(amount),
    })
    const name = selectedCategory?.name ?? ''

    if (!onCreated) createBudget.refresh()
    close()

    window.setTimeout(() => onCreated?.(name), MOTION.sheet)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={close}>
      <div
        className={`liquid-glass max-h-[88dvh] w-full max-w-sm select-none rounded-t-[24px] border-b-0 sm:max-w-md sm:rounded-[24px] ${closing ? 'sheet-out' : 'sheet-in'} ${sliding ? 'is-sliding overflow-hidden' : 'sheet-settled overflow-y-auto'}`}
        style={{
          backdropFilter: sliding ? 'none' : 'blur(40px) saturate(1.7)',
          WebkitBackdropFilter: sliding ? 'none' : 'blur(40px) saturate(1.7)',
          backgroundImage: 'linear-gradient(var(--lg-veil), var(--lg-veil)), var(--lg-grad)',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.35), var(--lg-inset)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-9 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="px-4 pb-5 pt-2">
          <p className="mb-3.5 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Nuevo presupuesto
          </p>

          <Preview category={selectedCategory} limit={Number(amount) || 0} />

          {/* Chips y no un <select>: con el preview al lado, elegir categoría es
              la decisión que da identidad a la tarjeta y merece verse entera. */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Categoría
          </p>
          <div className="flex flex-wrap gap-2">
            {categories?.map((c) => {
              const selected = String(c.id) === categoryId
              const color = c.color ?? '#d4af37'
              const tint = categorySwatch(color)
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => { setPickedCategoryId(String(c.id)); setErrors((e) => ({ ...e, categoryId: '' })) }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex h-10 cursor-pointer items-center gap-[7px] rounded-[13px] border px-3.5 text-[12.5px] font-bold transition-colors"
                  style={selected
                    ? { background: `${color}22`, borderColor: tint, color: tint }
                    : { background: 'var(--lg-ic-grad)', borderColor: 'var(--lg-ic-border)', color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: selected ? tint : 'var(--text-muted)', lineHeight: 0 }}>
                    <BudgetCategoryIcon name={c.icon} size={15} />
                  </span>
                  {c.name}
                </motion.button>
              )
            })}
          </div>
          {errors.categoryId && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.categoryId}</p>}
          {replaces && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--warning)' }}>
              Esta categoría ya tiene un presupuesto en esa cuenta: se reemplazará su límite.
            </p>
          )}

          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
            Límite mensual
          </p>
          <div
            className="liquid-glass-ic flex h-[58px] w-full items-center gap-2 rounded-[16px] px-[15px]"
            style={errors.amount ? { borderColor: 'var(--danger)' } : undefined}
          >
            <span className="text-[19px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d.]/g, '')
                setAmount(clean)
                setErrors((err) => ({ ...err, amount: '' }))
              }}
              placeholder="0.00"
              autoComplete="off"
              className="mono-amount w-full bg-transparent text-[26px] font-extrabold tracking-[-0.02em] tabular-nums outline-none"
              style={{ color: Number(amount) > 0 ? 'var(--text-primary)' : 'var(--text-placeholder)' }}
            />
          </div>
          {errors.amount && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}

          <div className="mt-5 flex gap-2">
            <motion.button
              type="button"
              onClick={close}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-11 flex-1 cursor-pointer rounded-full text-[13px] font-semibold"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleCreate}
              disabled={createBudget.isPending}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-11 flex-1 cursor-pointer rounded-full text-[13px] font-bold disabled:opacity-60"
              style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
            >
              {createBudget.isPending ? 'Guardando...' : replaces ? 'Reemplazar' : 'Crear'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
