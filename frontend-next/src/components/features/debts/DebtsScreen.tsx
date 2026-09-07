'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useDebts } from '@/lib/hooks/useDebts'
import type { Debt, DebtDirection } from '@/types'

import { DebtCreateSheet } from './DebtCreateSheet'
import { DebtPaySheet } from './DebtPaySheet'
import { DebtPersonCard } from './DebtPersonCard'
import { DebtSettledRow } from './DebtSettledRow'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const TABS: { direction: DebtDirection; label: string }[] = [
  { direction: 'THEY_OWE', label: 'Me deben' },
  { direction: 'I_OWE', label: 'Debo' },
]

function SegmentedTabs({
  active,
  onChange,
}: {
  active: DebtDirection
  onChange: (d: DebtDirection) => void
}) {
  return (
    <div className="liquid-glass mx-4 mb-3.5 flex gap-1.5 rounded-full p-[5px]">
      {TABS.map(({ direction, label }) => {
        const on = active === direction
        return (
          <button
            key={direction}
            type="button"
            onClick={() => onChange(direction)}
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

export function DebtsScreen() {
  const { exitClass, goBack } = useSubPageExit()
  const [direction, setDirection] = useState<DebtDirection>('THEY_OWE')
  const [paying, setPaying] = useState<{ debt: Debt; personName: string } | null>(null)
  const [collected, setCollected] = useState<number | null>(null)
  /* Solo una persona abierta a la vez: con varias desplegadas se pierde el
     sentido de la vista compacta. */
  const [openPerson, setOpenPerson] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  /* Guarda lo creado, no un booleano: el aviso nombra a la persona y el monto,
     y la hoja ya se cerró cuando se muestra. */
  const [created, setCreated] = useState<{ amount: number; personName: string } | null>(null)

  const { data: groups = [], isLoading } = useDebts(direction)
  const iOwe = direction === 'I_OWE'

  /* Lo PENDIENTE se agrupa por persona —se cobra a la persona—, pero lo
     SALDADO se lista suelto: es un historial, y cada devolución es un hecho
     con su fecha. */
  const pending = groups
    .map((g) => {
      const open = g.debts.filter((d) => d.status !== 'SETTLED')
      // Se recalcula sobre las deudas que quedan en la tarjeta en vez de usar
      // el `pending` del grupo: así el total de la cabecera SIEMPRE es la suma
      // de lo que hay debajo, aunque cambie el filtrado.
      return { ...g, debts: open, pending: open.reduce((acc, d) => acc + d.pending, 0) }
    })
    .filter((g) => g.debts.length > 0)

  const settled = groups
    .flatMap((g) => g.debts.filter((d) => d.status === 'SETTLED').map((d) => ({ debt: d, personName: g.personName })))
    .sort((a, b) => (b.debt.settledOn ?? '').localeCompare(a.debt.settledOn ?? ''))

  const total = pending.reduce((acc, g) => acc + g.pending, 0)

  return (
    <div className={exitClass}>
      <SubPageHeader
        title="Deudas"
        onBack={goBack}
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            aria-label={iOwe ? 'Registrar lo que debo' : 'Registrar un préstamo'}
            className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            <Plus size={20} strokeWidth={2.2} />
          </button>
        }
      />

      <SegmentedTabs active={direction} onChange={setDirection} />

      <div className="liquid-glass enter-pop mx-4 mb-[18px] rounded-[22px] px-[18px] py-4" style={{ ['--enter-i' as string]: 0 }}>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
          {iOwe ? 'Total que debo' : 'Total por cobrar'}
        </p>
        <div
          className="mono-amount text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          S/ {money(total)}
        </div>
        <p className="mt-[7px] text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {pending.length === 0
            ? 'Nada pendiente'
            : `${pending.length} ${pending.length === 1 ? 'persona' : 'personas'}`}
        </p>
      </div>

      {isLoading ? (
        <div className="px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-2.5 h-[104px] animate-pulse rounded-[22px]" style={{ background: 'var(--skeleton-from)' }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="px-8 py-10 text-center text-[12.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {iOwe
            ? 'No debes nada. Con + registras dinero que te prestaron.'
            : 'Nadie te debe. Al registrar un gasto puedes marcar qué parte deben otros, o usa + para un préstamo suelto.'}
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <p className="px-[18px] pb-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
                Pendientes
              </p>
              {pending.map((g) => (
                <DebtPersonCard
                  key={g.personName}
                  group={g}
                  iOwe={iOwe}
                  open={openPerson === g.personName}
                  onToggle={() => setOpenPerson((cur) => (cur === g.personName ? null : g.personName))}
                  onCollect={(debt) => setPaying({ debt, personName: g.personName })}
                />
              ))}
            </>
          )}

          {settled.length > 0 && (
            <>
              <p className="mt-4 px-[18px] pb-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
                Saldadas
              </p>
              {settled.map(({ debt, personName }) => (
                <DebtSettledRow key={debt.id} debt={debt} personName={personName} iOwe={iOwe} />
              ))}
            </>
          )}
        </>
      )}

      {creating && (
        <DebtCreateSheet
          direction={direction}
          onClose={() => setCreating(false)}
          onDone={(debt) => { setCreating(false); setCreated(debt) }}
        />
      )}

      {paying && (
        <DebtPaySheet
          debt={paying.debt}
          personName={paying.personName}
          onClose={() => setPaying(null)}
          onDone={(amount) => { setPaying(null); setCollected(amount) }}
        />
      )}

      <SuccessDialog
        open={created !== null}
        title={iOwe ? 'Deuda registrada' : 'Préstamo registrado'}
        description={
          created
            ? iOwe
              ? `Le debes S/ ${money(created.amount)} a ${created.personName}. El dinero entró a tu billetera.`
              : `${created.personName} te debe S/ ${money(created.amount)}. El dinero salió de tu billetera.`
            : undefined
        }
        onClose={() => setCreated(null)}
      />

      <SuccessDialog
        open={collected !== null}
        title={iOwe ? 'Pagado' : 'Cobrado'}
        description={
          collected !== null
            ? `S/ ${money(collected)} ${iOwe ? 'salieron de' : 'entraron a'} tu billetera.`
            : undefined
        }
        onClose={() => setCollected(null)}
      />
    </div>
  )
}
