'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { BudgetCard } from '@/components/features/budgets/BudgetCard'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { BudgetCardSkeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useBudgets, useCreateBudget, useDeleteBudget } from '@/lib/hooks/useBudgets'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function BudgetsPage() {
  const { data, isLoading } = useBudgets()
  const createBudget = useCreateBudget()
  const deleteBudget = useDeleteBudget()
  const { data: categories } = useCategories('EXPENSE')

  const now = new Date()
  const [showForm, setShowForm] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)

  function resetForm() {
    setCategoryId('')
    setAmount('')
    setMonth(String(now.getMonth() + 1))
    setYear(String(now.getFullYear()))
    setErrors({})
    setShowForm(false)
  }

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
    resetForm()
  }

  const currentYear = now.getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      <SubPageHeader
        title="Presupuestos"
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
      {/* Create form + list coordinated */}
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
                className="flex flex-col gap-3 rounded-[17px] p-5"
                style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
              >
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>
                  Nuevo presupuesto
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="col-span-2">
                    <Select value={categoryId} onValueChange={setCategoryId}>
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

                  {/* Month */}
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger label="Mes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Year */}
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger label="Año">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BudgetCardSkeleton key={i} />)
        ) : !data?.length ? (
          <EmptyState
            title="Sin presupuestos"
            description="Crea un presupuesto mensual para controlar tus gastos por categoría."
          />
        ) : (
          data.map((budget, i) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              index={i}
              onDelete={(id) => setDeleteId(id)}
            />
          ))
        )}
      </div>
      </div>

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar presupuesto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteBudget.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
