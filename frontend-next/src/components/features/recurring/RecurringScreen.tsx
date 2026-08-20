'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { RecurringAccessIcon } from '@/components/features/recurring/RecurringAccessIcon'
import { RecurringForm, type CreatedRecurring } from '@/components/features/recurring/RecurringForm'
import { AccessCard } from '@/components/features/shared/AccessCard'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useCreateRecurring, useDeleteRecurring, useRecurring, useToggleRecurring } from '@/lib/hooks/useRecurring'
import { usePendingOccurrences } from '@/lib/hooks/useRecurringOccurrences'
import { useFilterStore } from '@/stores/filterStore'
import type { RecurringExpense } from '@/types'

import { RecurringHero } from './RecurringHero'
import { RecurringRow } from './RecurringRow'

function ListSkeleton() {
  return (
    <div className="mx-4 flex flex-col gap-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[60px] animate-pulse rounded-[15px]" style={{ background: 'var(--skeleton-from)' }} />
      ))}
    </div>
  )
}

/**
 * Pantalla de gastos frecuentes.
 *
 * Arriba va lo accionable —las ocurrencias que esperan confirmación— y debajo
 * las reglas, que son configuración. El scheduler ya no crea el gasto solo:
 * genera una ocurrencia que el usuario confirma o rechaza.
 */
export function RecurringScreen() {
  const { exitClass, open, goBack } = useSubPageExit()
  const activeWalletId = useFilterStore((s) => s.walletId)

  const { data: items = [], isLoading } = useRecurring(activeWalletId)
  const { data: pending = [] } = usePendingOccurrences()

  const toggleRecurring = useToggleRecurring()
  const deleteRecurring = useDeleteRecurring()
  /** Solo para refrescar tras el alta: la mutación en sí vive en el formulario,
   *  pero el refresh debe correr cuando se descarta el aviso. */
  const createRecurring = useCreateRecurring()

  const [showForm, setShowForm] = useState(false)
  /** Se guarda el item entero y no solo el id: el aviso de éxito necesita el
   *  nombre, y para entonces ya no está en la lista. */
  const [toDelete, setToDelete] = useState<RecurringExpense | null>(null)
  const [deleted, setDeleted] = useState<string | null>(null)
  /** Llega cuando el sheet ya se cerró, para no apilar dos capas. */
  const [created, setCreated] = useState<CreatedRecurring | null>(null)
  const [toggled, setToggled] = useState<{ name: string; paused: boolean } | null>(null)

  return (
    <div className={exitClass}>
      <SubPageHeader title="Frecuentes" onBack={goBack} />

      <div className="enter-pop" style={{ ['--enter-i' as string]: 0 }}>
        {isLoading ? (
          <div className="mx-4 mb-3.5 h-[132px] animate-pulse rounded-[22px]" style={{ background: 'var(--skeleton-from)' }} />
        ) : (
          <RecurringHero items={items} />
        )}
      </div>

      {/* Idéntica a las cards del detalle de billetera: cristal neutro, sin
          tinte. El estado va en el caption, no en el color del icono. */}
      <div className="enter-pop mx-4 mb-3.5 flex" style={{ ['--enter-i' as string]: 1 }}>
        <AccessCard
          wide
          chevron
          title="Por confirmar"
          caption={pending.length === 0
            ? 'Nada pendiente'
            : `${pending.length} ${pending.length === 1 ? 'pendiente' : 'pendientes'}`}
          icon={<RecurringAccessIcon name="por-confirmar" />}
          onClick={() => open('/recurring/pending')}
        />
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
        <ListSkeleton />
      ) : items.length === 0 ? (
        <div className="px-4">
          <EmptyState
            title="Sin gastos frecuentes"
            description="Crea uno para suscripciones o gastos fijos como el alquiler."
          />
        </div>
      ) : (
        <div className="liquid-glass mx-4 rounded-[20px] p-1.5">
          {items.map((item, i) => (
            <div key={item.id} className="enter-pop" style={{ ['--enter-i' as string]: i + 2 }}>
              <RecurringRow
                item={item}
                onToggle={() => toggleRecurring.mutate(item.id, {
                  onSuccess: () => setToggled({ name: item.description, paused: item.active }),
                })}
                onDelete={() => setToDelete(item)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="h-24" />

      <button
        type="button"
        onClick={() => setShowForm(true)}
        aria-label="Nuevo gasto frecuente"
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

      <RecurringForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={setCreated}
      />

      <ConfirmDialog
        open={toDelete != null}
        title="¿Eliminar este frecuente?"
        description={toDelete
          ? `"${toDelete.description}" dejará de generar gastos. Esta acción no se puede deshacer.`
          : undefined}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (!toDelete) return
          const name = toDelete.description
          deleteRecurring.mutate(toDelete.id, { onSuccess: () => setDeleted(name) })
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />

      <SuccessDialog
        open={deleted != null}
        title="Frecuente eliminado"
        description={deleted ? `"${deleted}" ya no generará gastos.` : undefined}
        onClose={() => { setDeleted(null); deleteRecurring.refresh() }}
      />

      <SuccessDialog
        open={created != null}
        title="Frecuente creado"
        description={created
          ? `"${created.description}" se registrará ${created.frequency} desde el ${created.startDate}.`
          : undefined}
        onClose={() => { setCreated(null); createRecurring.refresh() }}
      />

      <SuccessDialog
        open={toggled != null}
        title={toggled?.paused ? 'Frecuente pausado' : 'Frecuente activado'}
        description={toggled
          ? toggled.paused
            ? `"${toggled.name}" no generará gastos hasta que lo reactives.`
            : `"${toggled.name}" volverá a generar gastos según su frecuencia.`
          : undefined}
        onClose={() => { setToggled(null); toggleRecurring.refresh() }}
      />
    </div>
  )
}
