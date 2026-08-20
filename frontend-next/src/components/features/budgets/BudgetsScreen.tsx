'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Plus } from 'lucide-react'

import { BudgetGridCard } from '@/components/features/budgets/BudgetGridCard'
import { BudgetLimitSheet } from '@/components/features/budgets/BudgetLimitSheet'
import { BudgetSheet } from '@/components/features/budgets/BudgetSheet'
import { BudgetsHero } from '@/components/features/budgets/BudgetsHero'
import { SmartEmptyBudgets } from '@/components/features/budgets/SmartEmptyBudgets'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from '@/lib/hooks/useBudgets'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import { useFilterStore } from '@/stores/filterStore'
import type { Budget } from '@/types'

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-[11px] px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[172px] animate-pulse rounded-[20px]" style={{ background: 'var(--skeleton-from)' }} />
      ))}
    </div>
  )
}

/** Rango del mes en curso, para las sugerencias del estado vacío. */
function currentMonthRange() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return {
    from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
    to: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`,
  }
}

export function BudgetsScreen() {

  const focusId = Number(useSearchParams().get('focus')) || null
  const focusCard = useRef<HTMLDivElement>(null)
  const { exitClass, open, goBack } = useSubPageExit()
  const activeWalletId = useFilterStore((s) => s.walletId)
  const { data: budgets, isLoading } = useBudgets(activeWalletId)

  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  /** Abierto el creador; con nombre, viene de una sugerencia del estado vacío. */
  const [creating, setCreating] = useState<{ preset?: string } | null>(null)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [saved, setSaved] = useState<{ name: string; action: 'create' | 'edit' } | null>(null)
  const [deletedName, setDeletedName] = useState<string | null>(null)

  useEffect(() => {
    if (focusId == null || isLoading) return
    focusCard.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId, isLoading])

  const { from, to } = currentMonthRange()
  const { data: breakdown } = useCategoryBreakdown({ period: 'CUSTOM', from, to, txType: 'EXPENSE' })

  const items = [...(budgets ?? [])].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))

  return (
    <div className={exitClass}>
      <SubPageHeader title="Presupuestos" onBack={goBack} />

      {/* El hero espera a los datos: con la lista a medias mostraba S/ 0 y
          saltaba al total real en cuanto llegaba. */}
      <div className="enter-pop" style={{ ['--enter-i' as string]: 0 }}>
        {isLoading ? (
          <div className="mx-4 mb-3.5 h-[132px] animate-pulse rounded-[22px]" style={{ background: 'var(--skeleton-from)' }} />
        ) : (
          <BudgetsHero budgets={items} />
        )}
      </div>

      <div className="flex items-center justify-between px-[18px] pb-2 pt-1">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          Todos
        </h2>
        <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
          {isLoading ? ' ' : items.length}
        </span>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <div className="px-4">
          <SmartEmptyBudgets breakdown={breakdown} onPick={(name) => setCreating({ preset: name })} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[11px] px-4">
          {items.map((b, i) => (
            <div
              key={b.id}
              ref={b.id === focusId ? focusCard : undefined}
              className="flex [&>button]:w-full"
            >
              <BudgetGridCard
                budget={b}
                index={i + 1}
                onOpen={() => { if (b.categoryId) open(`/categories/${b.categoryId}`) }}
                onEdit={() => setEditing(b)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Crear vive en un botón flotante, no como tarjeta al final del grid: así
          queda al alcance sin importar cuánto se haya scrolleado. */}
      <button
        type="button"
        onClick={() => setCreating({})}
        aria-label="Nuevo presupuesto"
        className="fixed bottom-5 right-5 z-30 flex h-[46px] cursor-pointer items-center gap-[7px] rounded-full px-[18px] text-[13.5px] font-extrabold transition-transform active:scale-95"
        style={{
          background: 'var(--accent-light)',
          color: 'var(--bg-base)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}
      >
        <Plus size={17} strokeWidth={2.4} />
        Nuevo
      </button>

      {creating && (
        <BudgetSheet
          presetCategoryName={creating.preset}
          onClose={() => setCreating(null)}
          onCreated={(name) => setSaved({ name, action: 'create' })}
        />
      )}

      {/* Sin AnimatePresence: el sheet anima su salida por CSS y retrasa el
          onClose hasta que termina (ver `closing` en BudgetLimitSheet). */}
      {editing && (
        <BudgetLimitSheet
          budget={editing}
          onClose={() => setEditing(null)}
          onSaved={(name) => setSaved({ name, action: 'edit' })}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar presupuesto?"
        description="El límite deja de aplicar. Los gastos de esa categoría no se tocan."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId == null) return
          const name = items.find((b) => b.id === deleteId)?.categoryName ?? ''
          deleteBudget.mutate(deleteId, { onSuccess: () => setDeletedName(name) })
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />

      {/* El refresh corre al descartar: así el hero recorre a la vista en vez de
          haber cambiado detrás del modal. */}
      <SuccessDialog
        open={saved != null}
        title={saved?.action === 'create' ? 'Presupuesto creado' : 'Límite actualizado'}
        description={saved
          ? saved.action === 'create'
            ? `El presupuesto para "${saved.name}" ya está activo.`
            : `El límite de "${saved.name}" se actualizó correctamente.`
          : undefined}
        onClose={() => {
          setSaved(null)
          createBudget.refresh()
          updateBudget.refresh()
        }}
      />

      <SuccessDialog
        open={deletedName != null}
        title="Presupuesto eliminado"
        description={deletedName ? `"${deletedName}" ya no tiene un límite definido.` : undefined}
        onClose={() => { setDeletedName(null); deleteBudget.refresh() }}
      />
    </div>
  )
}
