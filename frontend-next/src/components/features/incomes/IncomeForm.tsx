'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { CategorySelector } from '@/components/features/shared/CategorySelector'
import { DateField } from '@/components/features/shared/DateField'
import { DescriptionField } from '@/components/features/shared/DescriptionField'
import { SheetSteps } from '@/components/features/shared/SheetSteps'
import { StepActions } from '@/components/features/shared/StepActions'
import type { TxSummary } from '@/components/features/shared/txSummary'
import { useFormSteps } from '@/components/features/shared/useFormSteps'
import { NotesField } from '@/components/features/shared/NotesField'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateIncome, useIncome, useUpdateIncome } from '@/lib/hooks/useIncomes'
import type { Income } from '@/types'

interface IncomeFormProps {
  incomeId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  /** Resumen de lo guardado, para el aviso de éxito del contenedor. */
  onSaved?: (summary: TxSummary) => void
}

interface FormInnerProps {
  income?: Income
  incomeId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  onSaved?: (summary: TxSummary) => void
}

function IncomeFormInner({ income, incomeId, onDone, onRequestDelete, onSaved }: FormInnerProps) {
  const router = useRouter()
  const isEdit = incomeId != null && incomeId > 0
  const embedded = onDone != null

  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()

  const [description, setDescription] = useState(income?.description ?? '')
  const [rawAmount, setRawAmount] = useState(income ? income.amount.toString() : '')
  const [date, setDate] = useState(
    income ? income.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  /**
   * La billetera viene del contexto, no se elige acá: para llegar a este
   * formulario ya se eligió una en el carrusel de /expenses o en /wallets, y
   * volver a preguntarlo mostraba una lista donde la primera opción era
   * justamente la que el usuario acababa de escoger.
   *
   * Al EDITAR manda la del movimiento: cambiarla por la del filtro movería el
   * gasto de billetera sin que nadie lo pidiera.
   */
  const activeWalletId = useActiveWallet()
  const walletId = income?.walletId?.toString() ?? (activeWalletId?.toString() ?? '')
  // Solo las ofrecidas en esta billetera: las ocultas no se listan.
  const { data: categories } = useCategories('INCOME', walletId ? Number(walletId) : undefined)
  const [categoryId, setCategoryId] = useState(income?.categoryId?.toString() ?? '')
  const [notes, setNotes] = useState(income?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { step, stepDir, goNext, goBack, goTo } = useFormSteps(2)

  /** Paso 1: monto, descripción y categoría. */
  function validateStep1(): boolean {
    const errs: Record<string, string> = {}
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!description.trim()) errs.description = 'Requerido'
    if (categories && categories.length > 0 && !categoryId) errs.categoryId = 'Selecciona una categoría'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /** Paso 2: cuenta y fecha. */
  function validateStep2(): boolean {
    const errs: Record<string, string> = {}
    if (!walletId) errs.amount = 'Crea una billetera antes de registrar'
    if (!date) errs.date = 'Selecciona una fecha'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {

    if (!validateStep1()) { goTo(1); return }
    if (!validateStep2()) return
    const payload = {
      amount: Number(rawAmount),
      description: description.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      walletId: walletId ? Number(walletId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }
    if (isEdit && incomeId) {
      await updateIncome.mutateAsync({ id: incomeId, data: payload as Omit<Income, 'id'> })
    } else {
      await createIncome.mutateAsync(payload)
    }
    onSaved?.({
      kind: 'income',
      edited: isEdit,
      amount: Number(rawAmount),
      label: description.trim(),
    })
    if (onDone) onDone()
    else router.push('/expenses')
  }

  const isSubmitting = createIncome.isPending || updateIncome.isPending

  return (
    <div className={`relative flex flex-col px-4 ${embedded ? 'pb-4' : 'pb-28'}`}>
      <SheetSteps step={step} total={2} label={step === 1 ? 'Cuánto y de qué' : 'Dónde y cuándo'} />

      <div key={step} className={stepDir === 'fwd' ? 'step-fwd' : 'step-back'}>
        {step === 1 ? (
          <>
            <AmountField
              label="Monto del ingreso"
              inputId="income-amount-input"
              value={rawAmount}
              error={errors.amount}
              onChange={(v) => {
                setRawAmount(v)
                if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
              }}
            />

            <DescriptionField
              value={description}
              placeholder="Ej. Salario, freelance, venta..."
              limit={FIELD_LIMITS.description}
              error={errors.description}
              onChange={(v) => { setDescription(v); setErrors(err => ({ ...err, description: '' })) }}
            />

            {categories && categories.length > 0 && (
              <CategorySelector
                categories={categories}
                selectedId={categoryId}
                error={errors.categoryId}
                onSelect={(id) => { setCategoryId(id); setErrors(e => ({ ...e, categoryId: '' })) }}
              />
            )}

            <StepActions
              nextLabel="Siguiente"
              onNext={() => goNext(validateStep1)}
              onCancel={embedded ? onDone : undefined}
            />
          </>
        ) : (
          <>
            <DateField value={date} onChange={setDate} />

            <NotesField
              value={notes}
              placeholder="Detalles adicionales del ingreso..."
              onChange={setNotes}
            />

            <StepActions
              nextLabel={isEdit ? 'Guardar' : 'Registrar'}
              pending={isSubmitting}
              onNext={handleSubmit}
              onBack={goBack}
              onDelete={isEdit ? onRequestDelete : undefined}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function IncomeForm({ incomeId, onDone, onRequestDelete, onSaved }: IncomeFormProps) {
  const isEdit = incomeId != null && incomeId > 0
  const { data: income, isLoading } = useIncome(incomeId ?? 0)

  if (isEdit && isLoading) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <IncomeFormInner
      key={income?.id ?? 'new'}
      income={income}
      incomeId={incomeId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
      onSaved={onSaved}
    />
  )
}
