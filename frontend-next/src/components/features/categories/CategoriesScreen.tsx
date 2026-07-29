'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteCategory } from '@/lib/hooks/useCategories'
import type { Category, CategoryType } from '@/types'

import { CategoriesHero } from './CategoriesHero'
import { CategoryCard } from './CategoryCard'
import { CategorySheet } from './CategorySheet'
import { useCategoryCards } from './useCategoryCards'

const TABS: { type: CategoryType; label: string }[] = [
  { type: 'EXPENSE', label: 'Gasto' },
  { type: 'INCOME', label: 'Ingreso' },
]

function SegmentedTabs({ active, onChange }: { active: CategoryType; onChange: (t: CategoryType) => void }) {
  return (
    <div className="liquid-glass mx-4 mb-3.5 flex gap-1.5 rounded-full p-[5px]">
      {TABS.map(({ type, label }) => {
        const on = active === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className="flex-1 cursor-pointer rounded-full py-2 text-[12.5px] font-bold transition-colors"
            style={on
              ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
              : { color: 'var(--text-muted)' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-[11px] px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[114px] animate-pulse rounded-[20px]" style={{ background: 'var(--skeleton-from)' }} />
      ))}
    </div>
  )
}

/**
 * Pantalla de categorías: hero con el total del mes y grid de tarjetas ordenado
 * por gasto. Las que no tuvieron movimientos quedan atenuadas al final.
 *
 * Cada tarjeta ofrece dos acciones sobre el mismo elemento — toque corto abre
 * los movimientos de esa categoría, presión sostenida abre el editor.
 */
export function CategoriesScreen() {
  const { exitClass, open, goBack } = useSubPageExit()
  const [activeType, setActiveType] = useState<CategoryType>('EXPENSE')
  const { cards, isLoading, total, topCategory, movementCount } = useCategoryCards(activeType)

  const deleteCategory = useDeleteCategory()
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const isExpense = activeType === 'EXPENSE'

  function openEditor(id: number) {
    const c = cards.find((x) => x.id === id)
    if (!c) return
    setEditing({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: activeType })
  }

  return (
    <div className={exitClass}>
      <SubPageHeader title="Categorías" onBack={goBack} />

      {/* Segmented y hero comparten el enter-pop del grid con índices previos:
          la pantalla entra como UNA secuencia encadenada en vez de que la
          cabecera aterrice suelta y por delante de las tarjetas. */}
      <div className="enter-pop" style={{ ['--enter-i' as string]: 0 }}>
        <SegmentedTabs active={activeType} onChange={setActiveType} />
      </div>

      {/* El hero también espera: con los datos a medias mostraba S/ 0 y saltaba
          al total real en cuanto llegaba el breakdown. */}
      <div className="enter-pop" style={{ ['--enter-i' as string]: 1 }}>
        {isLoading ? (
          <div className="mx-4 mb-3.5 h-[132px] animate-pulse rounded-[22px]" style={{ background: 'var(--skeleton-from)' }} />
        ) : (
          <CategoriesHero
            total={total}
            isExpense={isExpense}
            topCategory={topCategory}
            categoryCount={cards.length}
            movementCount={movementCount}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-[18px] pb-2 pt-1">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          Todas
        </h2>
        <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text-placeholder)' }}>
          {isLoading ? ' ' : `${cards.length} activa${cards.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : cards.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Sin categorías. Crea una para empezar.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-[11px] px-4">
          {cards.map((c, i) => (
            <CategoryCard
              key={c.id}
              category={c}
              // +2: el segmented y el hero ocupan los dos primeros lugares del
              // stagger, así la secuencia continúa en vez de reiniciarse.
              index={i + 2}
              onOpen={() => open(`/categories/${c.id}`)}
              onEdit={() => openEditor(c.id)}
            />
          ))}
        </div>
      )}

      {/* Crear vive en un botón flotante, no como tarjeta al final del grid:
          así queda al alcance sin importar cuánto se haya scrolleado.
          /categories es focused route (sin bottom-nav), así que nada compite
          por esta esquina. */}
      <button
        type="button"
        onClick={() => setCreating(true)}
        aria-label="Nueva categoría"
        className="fixed bottom-5 right-5 z-30 flex h-[46px] cursor-pointer items-center gap-[7px] rounded-full px-[18px] text-[13.5px] font-extrabold transition-transform active:scale-95"
        style={{
          background: 'var(--accent-light)',
          color: 'var(--bg-base)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}
      >
        <Plus size={17} strokeWidth={2.4} />
        Nueva
      </button>

      {/* Sin AnimatePresence: el sheet anima su salida por CSS y retrasa el
          onClose hasta que termina (ver `closing` en CategorySheet). */}
      {(editing || creating) && (
        <CategorySheet
          type={activeType}
          category={editing ?? undefined}
          onClose={() => { setEditing(null); setCreating(false) }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="¿Eliminar categoría?"
        description={isExpense
          ? 'Los gastos asociados perderán su categoría.'
          : 'Los ingresos asociados perderán su categoría.'}
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteId != null) deleteCategory.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
