'use client'

import { useState } from 'react'

import { Check, X } from 'lucide-react'

import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import {
  useConfirmOccurrence,
  usePendingOccurrences,
  useRejectOccurrence,
} from '@/lib/hooks/useRecurringOccurrences'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { MOTION } from '@/lib/utils/motion'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { RecurringOccurrence } from '@/types'

function dueLabel(iso: string): string {
  const due = new Date(iso + 'T12:00:00')
  const today = new Date()
  const sameYear = due.getFullYear() === today.getFullYear()
  const date = due.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const isToday = due.toDateString() === today.toDateString()
  return isToday ? `Vence hoy · ${date}` : `Venció el ${date}`
}

export interface OccurrenceOutcome {
  action: 'confirm' | 'reject'
  description: string
  amount: number
}

function OccurrenceCard({ item, onDone }: { item: RecurringOccurrence; onDone: (o: OccurrenceOutcome) => void }) {
  const confirm = useConfirmOccurrence()
  const reject = useRejectOccurrence()
  const [leaving, setLeaving] = useState(false)
  const busy = confirm.isPending || reject.isPending || leaving

  /** El aviso lo levanta la pantalla, no la tarjeta: al resolverse, esta
   *  desaparece de la lista y se desmontaría con el diálogo dentro. */
  function decide(action: 'confirm' | 'reject') {
    const mutation = action === 'confirm' ? confirm : reject
    mutation.mutate(item.id, {
      onSuccess: () => {
        setLeaving(true)
        window.setTimeout(
          () => onDone({ action, description: item.description, amount: item.amount ?? 0 }),
          MOTION.layer,
        )
      },
    })
  }

  const color = item.categoryColor ?? '#d4af37'
  const Icon = CATEGORY_ICON_MAP[item.categoryIcon ?? 'ellipsis'] ?? CATEGORY_ICON_MAP.ellipsis

  return (
    <div
      className="liquid-glass rounded-[20px] p-3"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(0.96)' : 'none',
        transition: `opacity ${MOTION.layer}ms var(--ease-sys), transform ${MOTION.layer}ms var(--ease-sys)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px]" style={{ background: `${color}1f` }}>
          <Icon size={15} style={{ color: categorySwatch(color) }} strokeWidth={1.85} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {item.description}
          </span>
          <span className="mt-0.5 block text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {dueLabel(item.dueDate)}
          </span>
        </span>
        <span className="mono-amount flex-none text-[13.5px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          S/ {(item.amount ?? 0).toFixed(2)}
        </span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide('reject')}
          className="liquid-glass-ic flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12.5px] font-bold transition-transform active:scale-[0.97] disabled:opacity-50"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={14} strokeWidth={2.4} />
          Rechazar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide('confirm')}
          className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12.5px] font-bold transition-transform active:scale-[0.97] disabled:opacity-50"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          <Check size={14} strokeWidth={2.6} />
          Confirmar
        </button>
      </div>
    </div>
  )
}

/**
 * Pantalla dedicada a las ocurrencias que esperan decisión.
 *
 * Vive aparte de la lista de reglas: mezclar lo accionable con la configuración
 * hacía que la pantalla principal tuviera dos propósitos. Se llega desde la
 * card de acceso del resumen.
 */
export function PendingOccurrencesScreen() {
  const { exitClass, goBack } = useSubPageExit()
  const { data: items = [], isLoading } = usePendingOccurrences()
  const [done, setDone] = useState<OccurrenceOutcome | null>(null)
  /** Solo por su `refresh`: la lista se recarga al descartar el aviso, no antes. */
  const confirm = useConfirmOccurrence()

  const amount = done ? `S/ ${done.amount.toFixed(2)}` : ''

  return (
    <div className={`subpage-in ${exitClass}`}>
      <SubPageHeader title="Por confirmar" onBack={goBack} />

      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[104px] animate-pulse rounded-[20px]" style={{ background: 'var(--skeleton-from)' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nada por confirmar"
            description="Cuando venza un gasto frecuente aparecerá acá para que lo confirmes o lo rechaces."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((o) => (
              <OccurrenceCard key={o.id} item={o} onDone={setDone} />
            ))}
          </div>
        )}
      </div>

      {/* Confirmar genera un gasto y rechazar deja una deuda: en ambos casos
          conviene decir qué pasó, porque la tarjeta desaparece sin más rastro. */}
      <SuccessDialog
        open={done != null}
        title={done?.action === 'confirm' ? 'Gasto registrado' : 'Ocurrencia rechazada'}
        description={done
          ? done.action === 'confirm'
            ? `"${done.description}" se registró por ${amount}.`
            : `"${done.description}" quedó pendiente de pago por ${amount}.`
          : undefined}
        onClose={() => { setDone(null); confirm.refresh() }}
      />
    </div>
  )
}
