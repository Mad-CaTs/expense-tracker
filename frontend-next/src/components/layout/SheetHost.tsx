'use client'

import { AnimatePresence } from 'framer-motion'

import { CreateSelectorSheet } from '@/components/features/expenses/CreateSelectorSheet'
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'
import { IncomeForm } from '@/components/features/incomes/IncomeForm'
import { TransferSheet } from '@/components/features/wallets/TransferSheet'
import { Sheet } from '@/components/ui/Sheet'
import { useDeleteExpense } from '@/lib/hooks/useExpenses'
import { useDeleteIncome } from '@/lib/hooks/useIncomes'
import { useWallets } from '@/lib/hooks/useWallets'
import { useSheetStore } from '@/stores/sheetStore'

export function SheetHost() {
  const active = useSheetStore((s) => s.active)
  const open = useSheetStore((s) => s.open)
  const close = useSheetStore((s) => s.close)
  const { data: wallets = [] } = useWallets()
  const deleteExpense = useDeleteExpense()
  const deleteIncome = useDeleteIncome()

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
    <AnimatePresence>
      {active && (
        <Sheet key={active.kind + ('id' in active ? `-${active.id ?? 'new'}` : '')} onClose={close} title={title()}>
          {active.kind === 'selector' && (
            <CreateSelectorSheet onSelect={(s) => open(s)} />
          )}

          {active.kind === 'expense-form' && (
            <ExpenseForm
              expenseId={active.id}
              onDone={close}
              onRequestDelete={active.id ? () => open({ kind: 'confirm-delete', id: active.id!, txType: 'expense', label: 'gasto' }) : undefined}
            />
          )}

          {active.kind === 'income-form' && (
            <IncomeForm
              incomeId={active.id}
              onDone={close}
              onRequestDelete={active.id ? () => open({ kind: 'confirm-delete', id: active.id!, txType: 'income', label: 'ingreso' }) : undefined}
            />
          )}

          {active.kind === 'transfer' && (
            <div className="px-4 pb-6 pt-2">
              <TransferSheet wallets={wallets} onDone={close} />
            </div>
          )}

          {active.kind === 'confirm-delete' && (
            <div className="flex flex-col gap-4 px-5 pb-6 pt-4">
              <div>
                <p className="t-title" style={{ color: 'var(--text-primary)' }}>¿Eliminar {active.label}?</p>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-muted)' }}>Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={close}
                  className="h-11 flex-1 rounded-full text-[13px] font-semibold cursor-pointer"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (active.txType === 'expense') deleteExpense.mutate(active.id)
                    else deleteIncome.mutate(active.id)
                    close()
                  }}
                  className="h-11 flex-1 rounded-full text-[13px] font-bold cursor-pointer"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </Sheet>
      )}
    </AnimatePresence>
  )
}
