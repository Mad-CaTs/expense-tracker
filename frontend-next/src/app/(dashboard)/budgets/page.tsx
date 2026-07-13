'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { BudgetCard } from '@/components/features/budgets/BudgetCard'
import { BudgetForm } from '@/components/features/budgets/BudgetForm'
import { BudgetOverview } from '@/components/features/budgets/BudgetOverview'
import { SmartEmptyBudgets } from '@/components/features/budgets/SmartEmptyBudgets'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { BudgetCardSkeleton } from '@/components/ui/Skeleton'
import { useBudgets, useDeleteBudget } from '@/lib/hooks/useBudgets'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import { useFilterStore } from '@/stores/filterStore'

export default function BudgetsPage() {
  const activeWalletId = useFilterStore((s) => s.walletId)
  const { data, isLoading } = useBudgets(activeWalletId)
  const deleteBudget = useDeleteBudget()
  const { data: categories } = useCategories('EXPENSE')

  const now = new Date()
  const [showForm, setShowForm] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [success, setSuccess] = useState<{ name: string; action: 'create' | 'edit' } | null>(null)

  const pad = (n: number) => String(n).padStart(2, '0')
  const mFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const mTo = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`
  const { data: breakdown } = useCategoryBreakdown({ period: 'CUSTOM', from: mFrom, to: mTo, txType: 'EXPENSE' })

  function startSuggested(name: string) {
    const cat = categories?.find((c) => c.name === name)
    if (cat) setCategoryId(String(cat.id))
    setShowForm(true)
  }

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
      {/* Overview hero */}
      {!isLoading && data && data.length > 0 && <BudgetOverview budgets={data} />}

      {/* Create form + list coordinated */}
      <BudgetForm
        open={showForm}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        onClose={() => setShowForm(false)}
        onCreated={(name) => setSuccess({ name, action: 'create' })}
      />

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BudgetCardSkeleton key={i} />)
        ) : !data?.length ? (
          <SmartEmptyBudgets breakdown={breakdown} onPick={startSuggested} />
        ) : (
          data.map((budget, i) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              index={i}
              onDelete={(id) => setDeleteId(id)}
              onSaved={(name, action) => setSuccess({ name, action })}
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

      <SuccessDialog
        open={success != null}
        title={success?.action === 'create' ? 'Presupuesto creado' : 'Presupuesto actualizado'}
        description={success ? (
          success.action === 'create'
            ? `El presupuesto para "${success.name}" fue creado correctamente.`
            : `El límite de "${success.name}" fue actualizado correctamente.`
        ) : undefined}
        onClose={() => setSuccess(null)}
      />
    </div>
  )
}
