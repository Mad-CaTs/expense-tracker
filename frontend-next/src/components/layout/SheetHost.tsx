'use client'

import { useRef, useState } from 'react'

import { CreateSelectorSheet } from '@/components/features/expenses/CreateSelectorSheet'
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'
import { IncomeForm } from '@/components/features/incomes/IncomeForm'
import { type TxSummary, txDialogDescription, txDialogTitle } from '@/components/features/shared/txSummary'
import { TransferSheet } from '@/components/features/wallets/TransferSheet'
import { Sheet, useSheetClose } from '@/components/ui/Sheet'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useCategories } from '@/lib/hooks/useCategories'
import { useDeleteExpense } from '@/lib/hooks/useExpenses'
import { useDeleteIncome } from '@/lib/hooks/useIncomes'
import { useCreateTransfer } from '@/lib/hooks/useTransfers'
import { useWallets } from '@/lib/hooks/useWallets'
import { useSheetStore } from '@/stores/sheetStore'

/**
 * Da a los formularios el cierre ANIMADO del sheet. Pasarles el `close` del
 * store haría desaparecer el panel de golpe, sin recorrido de salida.
 */
function SheetBody({ render }: { render: (close: () => void) => React.ReactNode }) {
  return <>{render(useSheetClose())}</>
}

export function SheetHost() {
  const active = useSheetStore((s) => s.active)
  const open = useSheetStore((s) => s.open)
  const close = useSheetStore((s) => s.close)
  const { data: wallets = [] } = useWallets()
  const deleteExpense = useDeleteExpense()
  const deleteIncome = useDeleteIncome()
  const transfer = useCreateTransfer()

  /** Lo guardado, a la espera de que el sheet termine de bajar. */
  const pending = useRef<TxSummary | null>(null)
  const [saved, setSaved] = useState<TxSummary | null>(null)

  // Precarga: los formularios consultan categorías al montarse, y esa respuesta
  // llegando a mitad del deslizamiento del sheet provoca un re-render que se
  // siente como un tirón. Pidiéndolas desde acá —que está montado siempre— ya
  // están en caché cuando el sheet abre.
  useCategories('EXPENSE')
  useCategories('INCOME')

  /**
   * El formulario reporta al guardar, pero el sheet todavía está bajando. Se
   * anota y se muestra en `dismissSheet`, que corre cuando el panel ya salió:
   * un timer propio acá se sumaba al del sheet y el aviso llegaba tarde, como
   * un segundo movimiento aparte.
   */
  function announce(summary: TxSummary) {
    pending.current = summary
  }

  /**
   * Lo llama el sheet cuando su animación de salida terminó. El aviso espera un
   * frame: desmontar el panel y montar el modal en el mismo commit deja los dos
   * trabajos de layout en el mismo frame, y en móvil eso se ve como un salto.
   */
  function dismissSheet() {
    close()
    const summary = pending.current
    if (!summary) return
    pending.current = null
    requestAnimationFrame(() => setSaved(summary))
  }

  /**
   * Recién al descartar el aviso se refrescan las consultas, para que el total
   * de la cabecera recorra a la vista y no cambie escondido tras el modal.
   */
  function dismiss() {
    const kind = saved?.kind
    setSaved(null)
    if (kind === 'expense') deleteExpense.refresh()
    else if (kind === 'income') deleteIncome.refresh()
    else if (kind === 'transfer') transfer.refresh()
  }

  function title(): string | undefined {
    if (!active) return undefined
    switch (active.kind) {
      case 'selector': return 'Nuevo registro'
      case 'expense-form': return active.id ? 'Editar gasto' : 'Nuevo gasto'
      case 'income-form': return active.id ? 'Editar ingreso' : 'Nuevo ingreso'
      case 'transfer': return 'Transferir'
      case 'confirm-delete': return undefined
    }
  }

  return (
    <>
      {/* Sin AnimatePresence: el sheet anima su salida por CSS y retrasa el
          onClose hasta que termina (ver `closing` en ui/Sheet). */}
      {active && (
        <Sheet key={active.kind + ('id' in active ? `-${active.id ?? 'new'}` : '')} onClose={dismissSheet} title={title()}>
          {active.kind === 'selector' && (
            <CreateSelectorSheet onSelect={(s) => open(s)} />
          )}

          {active.kind === 'expense-form' && (
            <SheetBody render={(dismiss) => (
              <ExpenseForm
                expenseId={active.id}
                onDone={dismiss}
                onSaved={announce}
                onRequestDelete={active.id ? () => open({ kind: 'confirm-delete', id: active.id!, txType: 'expense', label: 'gasto' }) : undefined}
              />
            )} />
          )}

          {active.kind === 'income-form' && (
            <SheetBody render={(dismiss) => (
              <IncomeForm
                incomeId={active.id}
                onDone={dismiss}
                onSaved={announce}
                onRequestDelete={active.id ? () => open({ kind: 'confirm-delete', id: active.id!, txType: 'income', label: 'ingreso' }) : undefined}
              />
            )} />
          )}

          {active.kind === 'transfer' && (
            <div className="px-4 pb-6 pt-2">
              <SheetBody render={(dismiss) => (
                <TransferSheet wallets={wallets} onDone={dismiss} onSaved={announce} />
              )} />
            </div>
          )}

          {active.kind === 'confirm-delete' && (
            <SheetBody render={(closeSheet) => (
            <div className="flex flex-col gap-4 px-5 pb-6 pt-4">
              <div>
                <p className="t-title" style={{ color: 'var(--text-primary)' }}>¿Eliminar {active.label}?</p>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-muted)' }}>Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeSheet}
                  className="h-11 flex-1 rounded-full text-[13px] font-semibold cursor-pointer"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const isExpense = active.txType === 'expense'
                    if (isExpense) await deleteExpense.mutateAsync(active.id)
                    else await deleteIncome.mutateAsync(active.id)
                    announce({ kind: isExpense ? 'expense' : 'income', edited: false, amount: 0, label: '', deleted: true })
                    closeSheet()
                  }}
                  className="h-11 flex-1 rounded-full text-[13px] font-bold cursor-pointer"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
            )} />
          )}
        </Sheet>
      )}

      <SuccessDialog
        open={saved != null}
        title={saved ? txDialogTitle(saved) : ''}
        description={saved ? txDialogDescription(saved) : undefined}
        onClose={dismiss}
      />
    </>
  )
}
