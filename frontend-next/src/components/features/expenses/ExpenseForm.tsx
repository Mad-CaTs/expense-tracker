'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AttachmentSection, type PendingFile } from '@/components/features/expenses/AttachmentSection'
import { ExpenseSplitField, type SplitRow } from '@/components/features/expenses/ExpenseSplitField'
import { AmountField } from '@/components/features/shared/AmountField'
import { CategorySelector } from '@/components/features/shared/CategorySelector'
import { DateField } from '@/components/features/shared/DateField'
import { DescriptionField } from '@/components/features/shared/DescriptionField'
import { SheetSteps } from '@/components/features/shared/SheetSteps'
import { StepActions } from '@/components/features/shared/StepActions'
import type { TxSummary } from '@/components/features/shared/txSummary'
import { useFormSteps } from '@/components/features/shared/useFormSteps'
import { NotesField } from '@/components/features/shared/NotesField'
import { uploadAttachment } from '@/lib/api/attachments'
import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useCategories } from '@/lib/hooks/useCategories'
import { useDebtsByExpense } from '@/lib/hooks/useDebts'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { DebtItem, Expense } from '@/types'

interface ExpenseFormProps {
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  /** Resumen de lo guardado, para el aviso de éxito del contenedor. */
  onSaved?: (summary: TxSummary) => void
}

interface FormInnerProps {
  expense?: Expense
  initialDebts: DebtItem[]
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  onSaved?: (summary: TxSummary) => void
}

function ExpenseFormInner({ expense, initialDebts, expenseId, onDone, onRequestDelete, onSaved }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0
  const embedded = onDone != null

  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState(expense?.description ?? '')
  const [rawAmount, setRawAmount] = useState(expense ? expense.amount.toString() : '')
  const [date, setDate] = useState(
    expense ? expense.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [categoryId, setCategoryId] = useState(expense ? expense.categoryId.toString() : '')
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
  const walletId = expense?.walletId?.toString() ?? (activeWalletId?.toString() ?? '')
  // Solo las ofrecidas en esta billetera: las ocultas no se listan.
  const { data: categories } = useCategories('EXPENSE', walletId ? Number(walletId) : undefined)
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [debts, setDebts] = useState<SplitRow[]>(
    // El monto viaja como número y la fila lo lleva como texto (ver SplitRow).
    initialDebts.map((d, i) => ({ ...d, amount: String(d.amount), key: `init${i}` })),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const { step, stepDir, goNext, goBack, goTo } = useFormSteps(3)

  /** Paso 1: monto, descripción y categoría. Se valida antes de avanzar para
   *  que el error se vea junto al campo que lo produce. */
  function validateStep1(): boolean {
    const errs: Record<string, string> = {}
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!description.trim()) errs.description = 'Requerido'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /** Paso 2: el reparto. El backend lo rechaza igual, pero avisar acá evita
   *  perder el formulario entero. */
  function validateSplit(): boolean {
    const shared = debts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0)
    if (shared > Number(rawAmount || 0)) {
      setErrors({ debts: 'Lo repartido supera el gasto' })
      return false
    }
    setErrors({})
    return true
  }

  /** Paso 3: cuenta y fecha. Se valida acá para no enviar y fallar en el server. */
  function validateStep2(): boolean {
    const errs: Record<string, string> = {}
    if (!walletId) errs.amount = 'Crea una billetera antes de registrar'
    if (!date) errs.date = 'Selecciona una fecha'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validateStep1()) { goTo(1); return }
    if (!validateSplit()) { goTo(2); return }
    if (!validateStep2()) return
    const payload = {
      description: description.trim(),
      amount: Number(rawAmount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
      walletId: walletId ? Number(walletId) : undefined,
      // Solo las filas con nombre y monto: una fila vacía a medio escribir no
      // debe llegar al backend.
      debts: debts
        .filter((d) => d.personName.trim() && Number(d.amount) > 0)
        // `key` es solo de UI y el monto se teclea como texto (ver SplitRow):
        // al backend va limpio y numérico.
        .map(({ personName, amount }) => ({ personName: personName.trim(), amount: Number(amount) })),
    }
    if (isEdit && expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, data: payload })
      await Promise.all(pendingFiles.map(p => uploadAttachment(expenseId, p.file)))
    } else {
      // El id solo existe después de crear, así que los adjuntos se suben acá y
      // no antes. Sin esto los archivos elegidos al registrar se descartaban en
      // silencio: la sección ni siquiera se mostraba.
      const created = await createExpense.mutateAsync(payload)
      if (pendingFiles.length > 0 && created?.id) {
        await Promise.all(pendingFiles.map(p => uploadAttachment(created.id, p.file)))
      }
    }
    setPendingFiles([])

    onSaved?.({
      kind: 'expense',
      edited: isEdit,
      amount: Number(rawAmount),
      label: description.trim(),
    })
    if (onDone) onDone()
    else router.push('/expenses')
  }

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  return (
    <div className={`relative flex flex-col px-4 ${embedded ? 'pb-4' : 'pb-28'}`}>
      <SheetSteps
        step={step}
        total={3}
        label={step === 1 ? 'Cuánto y en qué' : step === 2 ? 'Cómo se reparte' : 'Dónde y cuándo'}
      />

      {/* key por paso: sin él React reusa el nodo y la animación no vuelve a
          correr al cambiar de sección. */}
      <div key={step} className={stepDir === 'fwd' ? 'step-fwd' : 'step-back'}>
        {step === 1 ? (
          <>
            <AmountField
              label="Monto del gasto"
              inputId="amount-keyboard-input"
              walletId={walletId ? Number(walletId) : undefined}
              value={rawAmount}
              error={errors.amount}
              onChange={(v) => {
                setRawAmount(v)
                if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
              }}
            />

            <DescriptionField
              value={description}
              placeholder="¿En qué gastaste?"
              limit={FIELD_LIMITS.description}
              error={errors.description}
              onChange={(v) => { setDescription(v); setErrors(e => ({ ...e, description: '' })) }}
            />

            <CategorySelector
              categories={categories}
              selectedId={categoryId}
              error={errors.categoryId}
              onSelect={(id) => { setCategoryId(id); setErrors(e => ({ ...e, categoryId: '' })) }}
            />

            <StepActions
              nextLabel="Siguiente"
              onNext={() => goNext(validateStep1)}
              onCancel={embedded ? onDone : undefined}
            />
          </>
        ) : step === 2 ? (
          <>
            <ExpenseSplitField
              items={debts}
              total={Number(rawAmount) || 0}
              error={errors.debts}
              onChange={(next) => { setDebts(next); setErrors(e => ({ ...e, debts: '' })) }}
            />

            <StepActions
              nextLabel="Siguiente"
              onNext={() => goNext(validateSplit)}
              onBack={goBack}
            />
          </>
        ) : (
          <>
            <DateField value={date} onChange={setDate} />

            <NotesField
              value={notes}
              placeholder="Comercio, referencia... (opcional)"
              onChange={setNotes}
            />

            {/* También al crear: los archivos quedan pendientes y se suben en
                cuanto el gasto tiene id (ver handleSubmit). */}
            <AttachmentSection
                expenseId={isEdit ? expenseId : undefined}
                pendingFiles={pendingFiles}
                onAddFiles={(files) => setPendingFiles(prev => [...prev, ...files])}
                onRemovePending={(id) => setPendingFiles(prev => prev.filter(p => p.id !== id))}
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

export function ExpenseForm({ expenseId, onDone, onRequestDelete, onSaved }: ExpenseFormProps) {
  const isEdit = expenseId != null && expenseId > 0
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)
  // El reparto no viaja dentro del gasto: se pide aparte. Sin esto, editar un
  // gasto repartido lo enviaría sin deudas y las borraría en silencio.
  const { data: existingDebts, isLoading: loadingDebts } = useDebtsByExpense(
    isEdit ? expenseId : undefined,
  )

  if (isEdit && (loadingExpense || loadingDebts)) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <ExpenseFormInner
      key={expense?.id ?? 'new'}
      expense={expense}
      initialDebts={existingDebts?.map((d) => ({ personName: d.personName, amount: d.amount })) ?? []}
      expenseId={expenseId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
      onSaved={onSaved}
    />
  )
}
