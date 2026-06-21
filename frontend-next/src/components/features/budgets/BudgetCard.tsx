'use client'

import { useState } from 'react'

import {
  Car,
  Check,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  Pencil,
  Trash2,
  Utensils,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useUpdateBudget } from '@/lib/hooks/useBudgets'
import type { Budget } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'heart-pulse': HeartPulse,
  film: Film,
  home: Home,
  ellipsis: Ellipsis,
  wallet: Wallet,
  zap: Zap,
}

interface BudgetCardProps {
  budget: Budget
  index: number
  onDelete?: (id: number) => void
  onSaved?: (categoryName: string, action: 'edit') => void
}

export function BudgetCard({ budget, index, onDelete, onSaved }: BudgetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [error, setError] = useState('')
  const updateBudget = useUpdateBudget()

  const pct = Math.min(budget.percentage ?? 0, 100)
  const spent = budget.spent ?? 0
  const amount = budget.amount ?? 0
  const remaining = amount - spent
  const isOverBudget = (budget.percentage ?? 0) > 100
  const isNearLimit = (budget.percentage ?? 0) > 80 && !isOverBudget

  const Icon = budget.categoryIcon ? (ICON_MAP[budget.categoryIcon] ?? Wallet) : Wallet
  const color = budget.categoryColor ?? '#d4af37'

  const barGradient = isOverBudget
    ? '#ef4444'
    : isNearLimit
      ? 'linear-gradient(90deg, #f97316, #fb923c)'
      : 'linear-gradient(90deg, #d4af37, #f0d060)'

  function startEdit() {
    setEditAmount(String(amount))
    setError('')
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setError('')
  }

  async function handleSave() {
    const parsed = Number(editAmount)
    if (!editAmount || isNaN(parsed) || parsed <= 0) {
      setError('Monto inválido')
      return
    }
    await updateBudget.mutateAsync({ id: budget.id, amount: parsed })
    setIsEditing(false)
    onSaved?.(budget.categoryName ?? '', 'edit')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-[18px] border p-[1px]"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
    >
      <div
        className="flex flex-col gap-4 rounded-[17px] p-5"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}14`, boxShadow: `0 0 0 1px ${color}18` }}
            >
              <Icon size={16} style={{ color }} strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {budget.categoryName ?? 'Sin categoría'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {budget.month}/{budget.year}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <div className="text-right mr-1">
              <p className="mono-amount text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                S/ {(spent ?? 0).toFixed(2)}
              </p>
              <p className="mono-amount text-[11px]" style={{ color: 'var(--text-dim)' }}>
                de S/ {(amount ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={startEdit}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--accent-light)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label="Editar presupuesto"
            >
              <Pencil size={13} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(budget.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
                aria-label="Eliminar presupuesto"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Inline edit panel */}
        <div
          className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ gridTemplateRows: isEditing ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="mb-1 flex flex-col gap-2 rounded-[14px] border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-placeholder)' }}>
                Nuevo límite (S/)
              </p>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={(e) => { setEditAmount(e.target.value); setError('') }}
                className="input-wrapper h-9 w-full px-3 text-sm"
                style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
              />
              {error && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                >
                  <X size={12} /> Cancelar
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={updateBudget.isPending}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold disabled:opacity-50"
                  style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
                >
                  <Check size={12} /> {updateBudget.isPending ? 'Guardando...' : 'Guardar'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: index * 0.06 + 0.12 }}
            className="h-full rounded-full"
            style={{ background: barGradient }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-medium"
            style={{ color: isOverBudget ? 'var(--danger)' : isNearLimit ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {isOverBudget
              ? `Excedido S/ ${Math.abs(remaining).toFixed(2)}`
              : `S/ ${remaining.toFixed(2)} restante`}
          </span>
          <span
            className="mono-amount text-[11px] font-semibold"
            style={{ color: isOverBudget ? 'var(--danger)' : isNearLimit ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {Math.round(budget.percentage ?? 0)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
