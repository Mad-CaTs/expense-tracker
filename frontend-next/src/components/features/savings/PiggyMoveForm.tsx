'use client'

import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { StepActions } from '@/components/features/shared/StepActions'
import { apiErrorMessage } from '@/lib/api/errors'
import { useMovePiggyBank } from '@/lib/hooks/usePiggyBanks'
import { formatMoney } from '@/lib/utils/currency'
import { todayIso } from '@/lib/utils/dates'
import type { PiggyBank, PiggyMovementType } from '@/types'

import { SheetViewTitle } from './SheetViewTitle'

const MODES: { type: PiggyMovementType; label: string }[] = [
  { type: 'DEPOSIT', label: 'Guardar' },
  { type: 'WITHDRAWAL', label: 'Sacar' },
]

interface PiggyMoveFormProps {
  piggy: PiggyBank
  initialType: PiggyMovementType
  /** Saldo disponible de la billetera: el tope para guardar. */
  available: number
  walletId: number
  currency?: string
  onBack: () => void
  onDone: (type: PiggyMovementType, amount: number) => void
}

/**
 * Guardar y sacar en una sola hoja. Sin fecha: el movimiento queda con la de
 * hoy, que es cuando se aparta (o se saca) la plata.
 */
export function PiggyMoveForm({ piggy, initialType, available, walletId, currency, onBack, onDone }: PiggyMoveFormProps) {
  const [type, setType] = useState<PiggyMovementType>(initialType)
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const move = useMovePiggyBank()

  const deposit = type === 'DEPOSIT'
  // El mismo tope que valida el servidor, a la vista: así no llega por sorpresa.
  const ceiling = Math.max(0, deposit ? available : piggy.balance)

  async function handleSubmit() {
    const amount = Number(raw)
    if (!amount || amount <= 0) { setError('Monto inválido'); return }
    if (amount > ceiling) { setError(deposit ? 'No tienes tanto disponible' : 'La alcancía no tiene tanto'); return }
    try {
      await move.mutateAsync({ id: piggy.id, type, amount, date: todayIso() })
      onDone(type, amount)
    } catch (err) {
      setError(apiErrorMessage(err, deposit ? 'No se pudo guardar' : 'No se pudo sacar'))
    }
  }

  return (
    <>
    <SheetViewTitle>{piggy.name}</SheetViewTitle>
    <div className="px-4 pb-4 pt-2">
      <div className="liquid-glass mb-4 flex gap-1.5 rounded-full p-[5px]">
        {MODES.map((m) => (
          <button
            key={m.type}
            type="button"
            onClick={() => { setType(m.type); setError('') }}
            disabled={m.type === 'WITHDRAWAL' && piggy.balance <= 0}
            className="flex-1 cursor-pointer rounded-full py-2 text-[12.5px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={type === m.type
              ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
              : { color: 'var(--text-muted)' }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <AmountField
        label={deposit ? 'Cuánto guardas' : 'Cuánto sacas'}
        inputId="piggy-move-amount"
        walletId={walletId}
        value={raw}
        error={error}
        max={ceiling}
        onChange={(v) => { setRaw(v); setError('') }}
      />
      {error ? (
        <p className="mt-2 text-center text-[11.5px]" style={{ color: 'var(--danger)' }}>{error}</p>
      ) : (
        <p className="mt-2 text-center text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {deposit ? 'Disponible en la billetera: ' : 'En la alcancía: '}
          <b className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{formatMoney(ceiling, currency)}</b>
        </p>
      )}

      <StepActions nextLabel={deposit ? 'Guardar' : 'Sacar'} onNext={handleSubmit} onBack={onBack} pending={move.isPending} />
    </div>
    </>
  )
}
