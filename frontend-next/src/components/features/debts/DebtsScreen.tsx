'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Plus } from 'lucide-react'

import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useDebts } from '@/lib/hooks/useDebts'
import type { Debt } from '@/types'

import { DebtCreateSheet } from './DebtCreateSheet'
import { DebtPaySheet } from './DebtPaySheet'
import { DebtPersonCard } from './DebtPersonCard'
import { DebtSettledMonthHeader } from './DebtSettledMonthHeader'
import { DebtSettledPersonGroup } from './DebtSettledPersonGroup'
import { DEBT_VIEWS, viewOf, type DebtTab } from './debtViews'
import { groupSettledByMonth } from './settledGroups'
import { useWalletCurrency, useWallets } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* Tope del escalonado: a 120ms por posición, la fila 10 entraría 1,2s después
   de la primera. Pasado este índice todas comparten el mismo retraso. */
const STAGGER_MAX = 6
const stagger = (position: number) => Math.min(position, STAGGER_MAX)

/** Me deben · Debo · Préstamos: una pestaña por caso, sin niveles debajo. */
function DebtTabs({ active, onChange }: { active: DebtTab; onChange: (t: DebtTab) => void }) {
  return (
    <div className="liquid-glass mx-4 mb-3.5 flex gap-1.5 rounded-full p-[5px]">
      {DEBT_VIEWS.map(({ tab, label }) => {
        const on = active === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
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
  const sym = symbolOf(useWalletCurrency())
  const { exitClass, goBack } = useSubPageExit()
  // `?dir=THEY_OWE` llega desde el aviso de /expenses: abre en lo que anunciaba.
  const params = useSearchParams()
  const [tab, setTab] = useState<DebtTab>(params.get('dir') === 'I_OWE' ? 'iOwe' : 'theyOwe')
  /* Lo que debes está repartido en dos pestañas (Debo y Préstamos). Hasta que
     el usuario elige, si la abierta no tiene pendientes y la otra sí, se pasa a
     esa: abrir en "No debes nada" cuando debes un préstamo se lee como error. */
  const userPicked = useRef(false)
  const [paying, setPaying] = useState<{ debt: Debt; personName: string } | null>(null)
  const [collected, setCollected] = useState<number | null>(null)
  /* Solo una persona abierta a la vez: con varias desplegadas se pierde el
     sentido de la vista compacta. */
  const [openPerson, setOpenPerson] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  /* Guarda lo creado, no un booleano: el aviso nombra a la persona y el monto,
     y la hoja ya se cerró cuando se muestra. */
  const [created, setCreated] = useState<{ title: string; description: string } | null>(null)

  const view = viewOf(tab)
  const { data: allGroups = [], isLoading } = useDebts(view.direction)
  const iOwe = view.direction === 'I_OWE'

  /* La API agrupa por persona y dirección; Debo y Préstamos comparten
     dirección y se separan acá. Una misma persona puede aparecer en las dos,
     cada vez solo con lo suyo. */
  const groups = allGroups
    .map((g) => ({ ...g, debts: g.debts.filter(view.includes) }))
    .filter((g) => g.debts.length > 0)

  useEffect(() => {
    if (userPicked.current || isLoading || !iOwe) return
    const other = viewOf(tab === 'iOwe' ? 'loans' : 'iOwe')
    const hasPending = (includes: (d: Debt) => boolean) =>
      allGroups.some((g) => g.debts.some((d) => d.status !== 'SETTLED' && includes(d)))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- elección inicial, una vez cargados los datos
    if (!hasPending(view.includes) && hasPending(other.includes)) setTab(other.tab)
  }, [allGroups, isLoading, iOwe, tab, view.includes])

  /* Lo PENDIENTE se agrupa por persona —se cobra a la persona—. Lo SALDADO es
     un historial: va por mes, que es lo que le da orden, y dentro de cada mes
     por persona para no repetir el mismo nombre fila tras fila. */
  const pending = groups
    .map((g) => {
      const open = g.debts.filter((d) => d.status !== 'SETTLED')
      // Se recalcula sobre las deudas que quedan en la tarjeta en vez de usar
      // el `pending` del grupo: así el total de la cabecera SIEMPRE es la suma
      // de lo que hay debajo, aunque cambie el filtrado.
      return { ...g, debts: open, pending: open.reduce((acc, d) => acc + d.pending, 0) }
    })
    .filter((g) => g.debts.length > 0)

  const settledMonths = groupSettledByMonth(groups)
  /* Posición de cada encabezado de mes en el escalonado: sigue a lo pendiente
     y a todo lo que tienen encima los meses anteriores. */
  const monthStart = settledMonths.map((_, i) =>
    settledMonths.slice(0, i).reduce((acc, m) => acc + m.people.length + 1, pending.length + 1),
  )

  const total = pending.reduce((acc, g) => acc + g.pending, 0)
  /* Las deudas viven en distintas billeteras, y esas pueden estar en monedas
     distintas. Este total las SUMA, así que solo se rotula con un símbolo
     cuando todas coinciden; mezcladas, la cifra va desnuda y cada tarjeta de
     abajo dice en qué moneda está la suya. Sumar soles con dólares y ponerle
     "S/" delante sería afirmar algo falso. */
  const { data: allWallets } = useWallets()
  const pendingSymbols = new Set(
    pending.flatMap((g) =>
      g.debts.map((d) => symbolOf(allWallets?.find((w) => w.id === d.walletId)?.currency)),
    ),
  )
  const totalSym = pendingSymbols.size === 1 ? [...pendingSymbols][0] : ''

  return (
    <div className={exitClass}>
      <SubPageHeader
        title="Deudas"
        onBack={goBack}
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            aria-label={view.create.title}
            className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            <Plus size={20} strokeWidth={2.2} />
          </button>
        }
      />

      <DebtTabs
        active={tab}
        onChange={(next) => {
          userPicked.current = true
          setTab(next)
          setOpenPerson(null)
        }}
      />

      {/* `key` por pestaña para que la entrada vuelva a correr: los hijos ya
          traen `enter-pop` con su stagger, que es como entra el contenido en
          toda la app. El deslizamiento lateral es de los formularios por
          pasos, no de un cambio de pestaña. */}
      <div key={tab}>
        <div className="liquid-glass enter-pop mx-4 mb-[18px] rounded-[22px] px-[18px] py-4" style={{ ['--enter-i' as string]: 0 }}>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
            {view.totalLabel}
          </p>
          <div
            className="amount-figure text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
            style={{ color: 'var(--text-primary)' }}
          >
            {totalSym && `${totalSym} `}{money(total)}
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
            {view.empty}
          </p>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <p className="px-[18px] pb-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
                  Pendientes
                </p>
                {pending.map((g, i) => (
                  <DebtPersonCard
                    key={g.personName}
                    group={g}
                    noun={view.noun}
                    index={Math.min(i + 1, STAGGER_MAX)}
                    iOwe={iOwe}
                    open={openPerson === g.personName}
                    onToggle={() => setOpenPerson((cur) => (cur === g.personName ? null : g.personName))}
                    onCollect={(debt) => setPaying({ debt, personName: g.personName })}
                  />
                ))}
              </>
            )}

            {settledMonths.length > 0 && (
              <>
                <p className="mt-4 px-[18px] text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-label)' }}>
                  Saldadas
                </p>
                {settledMonths.map((month, mi) => (
                  <Fragment key={month.key}>
                    <DebtSettledMonthHeader month={month} index={stagger(monthStart[mi])} />
                    {month.people.map((person, pi) => (
                      <DebtSettledPersonGroup
                        key={person.personName}
                        person={person}
                        index={stagger(monthStart[mi] + 1 + pi)}
                        iOwe={iOwe}
                      />
                    ))}
                  </Fragment>
                ))}
              </>
            )}
          </>
        )}

      </div>

      {/* El + registra lo de la vista en la que estás: el tipo ya está elegido. */}
      {creating && (
        <DebtCreateSheet
          direction={view.direction}
          config={view.create}
          onClose={() => setCreating(false)}
          onDone={(debt) => {
            setCreating(false)
            setCreated(view.created(`${sym} ${money(debt.amount)}`, debt.personName))
          }}
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
        title={created?.title ?? ''}
        description={created?.description}
        onClose={() => setCreated(null)}
      />

      <SuccessDialog
        open={collected !== null}
        title={iOwe ? 'Pagado' : 'Cobrado'}
        description={
          collected !== null
            ? `${sym} ${money(collected)} ${iOwe ? 'salieron de' : 'entraron a'} tu billetera.`
            : undefined
        }
        onClose={() => setCollected(null)}
      />
    </div>
  )
}
