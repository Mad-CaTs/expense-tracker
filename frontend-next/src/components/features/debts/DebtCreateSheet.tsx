'use client'

import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { DateField } from '@/components/features/shared/DateField'
import { DescriptionField } from '@/components/features/shared/DescriptionField'
import { StepActions } from '@/components/features/shared/StepActions'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import { Sheet } from '@/components/ui/Sheet'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useCreateDebt } from '@/lib/hooks/useDebts'
import { useWallets } from '@/lib/hooks/useWallets'
import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'
import type { DebtDirection } from '@/types'

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DebtCreateSheetProps {
  /** Pestaña desde la que se abrió: ya se sabe la dirección. */
  direction: DebtDirection
  onClose: () => void
  /** Devuelve lo creado para que la pantalla lo nombre en el aviso. */
  onDone: (debt: { amount: number; personName: string }) => void
}

/**
 * Alta de un préstamo SUELTO: dinero que se prestó o que le prestaron a uno,
 * sin gasto de por medio.
 *
 * <p>A diferencia del reparto de un gasto, este SÍ mueve el saldo al crearse:
 * no hay ningún `Expense` que ya haya descontado ese dinero.
 */
export function DebtCreateSheet({ direction, onClose, onDone }: DebtCreateSheetProps) {
  const iOwe = direction === 'I_OWE'
  const { data: wallets } = useWallets()
  const activeWalletId = useActiveWallet()
  const createDebt = useCreateDebt()

  const [personName, setPersonName] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIso())
  const [walletId, setWalletId] = useState(activeWalletId ? String(activeWalletId) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!personName.trim()) errs.personName = 'Requerido'
    if (!rawAmount || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!walletId) errs.wallet = 'Elige una billetera'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    await createDebt.mutateAsync({
      direction,
      personName: personName.trim(),
      amount: Number(rawAmount),
      walletId: Number(walletId),
      description: description.trim() || undefined,
      incurredOn: date,
    })
    onDone({ amount: Number(rawAmount), personName: personName.trim() })
  }

  return (
    <Sheet onClose={onClose} title={iOwe ? 'Registrar lo que debo' : 'Registrar un préstamo'}>
      <div className="px-4 pb-4">
        <AmountField
          label={iOwe ? 'Cuánto te prestaron' : 'Cuánto prestaste'}
          inputId="debt-new-amount"
          walletId={walletId ? Number(walletId) : undefined}
          value={rawAmount}
          error={errors.amount}
          onChange={(v) => { setRawAmount(v); setErrors((e) => ({ ...e, amount: '' })) }}
        />

        <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
          {iOwe ? '¿Quién te prestó?' : '¿A quién le prestaste?'}
        </p>
        <input
          value={personName}
          onChange={(e) => { setPersonName(e.target.value); setErrors((x) => ({ ...x, personName: '' })) }}
          placeholder="Nombre"
          autoComplete="off"
          maxLength={FIELD_LIMITS.personName}
          className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] font-semibold outline-none"
          style={{ color: 'var(--text-primary)', ...(errors.personName ? { borderColor: 'var(--danger)' } : {}) }}
        />
        {errors.personName && (
          <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.personName}</p>
        )}

        <DescriptionField
          value={description}
          placeholder="¿Para qué? (opcional)"
          limit={FIELD_LIMITS.description}
          onChange={setDescription}
        />

        <DateField value={date} onChange={setDate} label="¿Cuándo fue?" />

        <WalletSelector
          wallets={wallets}
          selectedId={walletId}
          error={errors.wallet}
          label={iOwe ? '¿A qué billetera entró?' : '¿De qué billetera salió?'}
          onSelect={(id) => { setWalletId(id); setErrors((e) => ({ ...e, wallet: '' })) }}
        />

        <StepActions
          nextLabel="Registrar"
          onNext={handleSubmit}
          onCancel={onClose}
          pending={createDebt.isPending}
        />
      </div>
    </Sheet>
  )
}
