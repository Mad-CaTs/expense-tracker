'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AttachmentSection, type PendingFile } from '@/components/features/expenses/AttachmentSection'
import { AmountField } from '@/components/features/shared/AmountField'
import { CategorySelector } from '@/components/features/shared/CategorySelector'
import { DateField } from '@/components/features/shared/DateField'
import { SheetSteps } from '@/components/features/shared/SheetSteps'
import { StepActions } from '@/components/features/shared/StepActions'
import type { TxSummary } from '@/components/features/shared/txSummary'
import { useFormSteps } from '@/components/features/shared/useFormSteps'
import { NotesField } from '@/components/features/shared/NotesField'
import { uploadAttachment } from '@/lib/api/attachments'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { Expense } from '@/types'

interface ExpenseFormProps {
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  /** Resumen de lo guardado, para el aviso de éxito del contenedor. */
  onSaved?: (summary: TxSummary) => void
}

interface FormInnerProps {
  expense?: Expense
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
  onSaved?: (summary: TxSummary) => void
}

function ExpenseFormInner({ expense, expenseId, onDone, onRequestDelete, onSaved }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0
  const embedded = onDone != null

  const { data: categories } = useCategories('EXPENSE')
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
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const { step, stepDir, goNext, goBack, goTo } = useFormSteps(2)

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

  /** Paso 2: cuenta y fecha. Se valida acá para no enviar y fallar en el server. */
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
      description: description.trim(),
      amount: Number(rawAmount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
      walletId: walletId ? Number(walletId) : undefined,
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
      <SheetSteps step={step} total={2} label={step === 1 ? 'Cuánto y en qué' : 'Dónde y cuándo'} />

      {/* key por paso: sin él React reusa el nodo y la animación no vuelve a
          correr al cambiar de sección. */}
      <div key={step} className={stepDir === 'fwd' ? 'step-fwd' : 'step-back'}>
        {step === 1 ? (
          <>
            <AmountField
              label="Monto del gasto"
              inputId="amount-keyboard-input"
              value={rawAmount}
              error={errors.amount}
              onChange={(v) => {
                setRawAmount(v)
                if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
              }}
            />

            <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
              Descripción
            </p>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(e => ({ ...e, description: '' })) }}
              placeholder="¿En qué gastaste?"
              autoComplete="off"
              className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] outline-none"
              style={{ color: 'var(--text-primary)', ...(errors.description ? { borderColor: 'var(--danger)' } : {}) }}
            />
            {errors.description && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.description}</p>}

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

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <ExpenseFormInner
      key={expense?.id ?? 'new'}
      expense={expense}
      expenseId={expenseId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
      onSaved={onSaved}
    />
  )
}
