'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { RecurringCard } from '@/components/features/recurring/RecurringCard'
import { RecurringForm } from '@/components/features/recurring/RecurringForm'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { BudgetCardSkeleton } from '@/components/ui/Skeleton'
import { useDeleteRecurring, useRecurring, useToggleRecurring } from '@/lib/hooks/useRecurring'
import { useFilterStore } from '@/stores/filterStore'

export default function RecurringPage() {
  const activeWalletId = useFilterStore((s) => s.walletId)
  const { data, isLoading } = useRecurring(activeWalletId)
  const toggleRecurring = useToggleRecurring()
  const deleteRecurring = useDeleteRecurring()

  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl">
      <SubPageHeader
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
      <div className="px-4 pb-8">
      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar este recurrente?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteRecurring.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Create form */}
      <RecurringForm open={showForm} onClose={() => setShowForm(false)} />

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
