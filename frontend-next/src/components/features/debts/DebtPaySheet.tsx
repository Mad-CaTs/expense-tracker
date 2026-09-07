'use client'

import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { DateField } from '@/components/features/shared/DateField'
import { StepActions } from '@/components/features/shared/StepActions'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import { Sheet } from '@/components/ui/Sheet'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { usePayDebt } from '@/lib/hooks/useDebts'
import { useWallets } from '@/lib/hooks/useWallets'
import type { Debt } from '@/types'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DebtPaySheetProps {
  debt: Debt
  personName: string
  onClose: () => void
  onDone: (amount: number) => void
}

/**
 * Cobrar (o pagar) una deuda.
 *
 * La billetera y la fecha se eligen: se pagó la cena con tarjeta y el amigo
 * devuelve en efectivo, otro día. Por eso no basta un botón de "saldar".
 */
export function DebtPaySheet({ debt, personName, onClose, onDone }: DebtPaySheetProps) {
  const iOwe = debt.direction === 'I_OWE'
  const { data: wallets } = useWallets()
  const activeWalletId = useActiveWallet()
  const payDebt = usePayDebt()

  const [rawAmount, setRawAmount] = useState(debt.pending.toString())
  const [date, setDate] = useState(todayIso())
  /* Una deuda nacida de un gasto no tiene billetera propia (el gasto ya
     descontó el total), así que se propone la activa. Sin esto el campo salía
     vacío y no había forma de cobrar sin elegir a mano. */
  const [walletId, setWalletId] = useState(
    debt.walletId ? String(debt.walletId) : activeWalletId ? String(activeWalletId) : '',
  )
  const [error, setError] = useState('')

  async function handleSubmit() {
    const amount = Number(rawAmount)
    if (!amount || amount <= 0) { setError('Monto inválido'); return }
    if (amount > debt.pending) { setError(`No puedes ${iOwe ? 'pagar' : 'cobrar'} más de S/ ${money(debt.pending)}`); return }
    if (!walletId) { setError('Elige una billetera'); return }

    await payDebt.mutateAsync({ id: debt.id, amount, walletId: Number(walletId), paidOn: date })
    onDone(amount)
  }

  return (
    <Sheet onClose={onClose} title={`${iOwe ? 'Pagar a' : 'Cobrar a'} ${personName}`}>
      <div className="px-4 pb-4">
        <p className="mb-3 text-center text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {debt.description || 'Préstamo'} · te {iOwe ? 'faltan' : 'deben'}{' '}
          <b style={{ color: 'var(--text-secondary)' }}>S/ {money(debt.pending)}</b>
        </p>

        <AmountField
          label={iOwe ? 'Cuánto pagas' : 'Cuánto te pagó'}
          inputId="debt-pay-amount"
          value={rawAmount}
          error={error}
          /* No deja teclear por encima de lo pendiente: avisar solo al enviar
             obligaba a corregir un número que la app ya sabía inválido. */
          max={debt.pending}
          onChange={(v) => { setRawAmount(v); setError('') }}
        />

        <DateField value={date} onChange={setDate} label={iOwe ? '¿Cuándo pagaste?' : '¿Cuándo te pagó?'} />

        <WalletSelector
          wallets={wallets}
          selectedId={walletId}
          label={iOwe ? '¿De qué billetera sale?' : '¿A qué billetera entró?'}
          onSelect={(id) => { setWalletId(id); setError('') }}
        />

        <StepActions
          nextLabel={iOwe ? 'Pagar' : 'Cobrar'}
          onNext={handleSubmit}
          onCancel={onClose}
          pending={payDebt.isPending}
        />
      </div>
    </Sheet>
  )
}
