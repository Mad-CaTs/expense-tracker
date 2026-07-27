'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'

import { WalletCarousel } from '@/components/features/expenses/WalletCarousel'
import { BudgetCarousel } from '@/components/features/expenses/BudgetCarousel'
import { MovementsRecurringSection } from '@/components/features/expenses/MovementsRecurringSection'
import { ActionIcon, type ActionIconName } from '@/components/features/expenses/ActionIcon'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useFilterStore } from '@/stores/filterStore'
import { useSheetStore } from '@/stores/sheetStore'

type QuickActionKind = 'expense-form' | 'income-form' | 'transfer' | 'scan'

const QUICK_ACTIONS: { label: string; icon: ActionIconName; kind: QuickActionKind }[] = [
  { label: 'Gasto',      icon: 'gasto',      kind: 'expense-form' },
  { label: 'Ingreso',    icon: 'ingreso',    kind: 'income-form'  },
  { label: 'Transferir', icon: 'transferir', kind: 'transfer'     },
  { label: 'Escanear',   icon: 'escanear',   kind: 'scan'         },
]

function QuickActions() {
  const openSheet = useSheetStore((s) => s.open)
  const [soon, setSoon] = useState(false)

  function handle(kind: QuickActionKind) {
    if (kind === 'scan') {
      setSoon(true)
      window.setTimeout(() => setSoon(false), 1800)
      return
    }
    openSheet({ kind })
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, icon, kind }, i) => (
          <motion.button
            key={kind}
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={() => handle(kind)}
            className="enter-pop liquid-glass flex flex-col items-center justify-center gap-2 rounded-[20px] py-4 cursor-pointer"
            style={{ ['--enter-i' as string]: i }}
          >
            <span style={{ color: 'var(--text-primary)' }}>
              <ActionIcon name={icon} size={24} />
            </span>
            <span className="text-[13.5px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {soon && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2.5 text-[13px] font-medium"
            style={{ background: 'var(--surface-overlay)', color: 'var(--text-primary)', boxShadow: 'var(--soft-raised)' }}
          >
            Escaneo de recibos · próximamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ExpensesPageInner() {
  const router = useRouter()
  const storeFilters = useFilterStore()

  function handleWalletSelect(id: number | undefined) {
    storeFilters.setWalletId(id)
    storeFilters.setPage(0)
  }

  return (
    <div className="mx-auto max-w-3xl pb-4">
      <WalletCarousel selectedWalletId={storeFilters.walletId} onSelect={handleWalletSelect} />

      <QuickActions />

      <div className="pt-3">
        <MovementsRecurringSection />
      </div>

      <div className="px-4 pt-6">
        <SectionHeader
          title="Presupuestos"
          onAction={() => router.push('/budgets')}
          actionLabel="Ver todos los presupuestos"
          actionVariant="icon"
          titleClassName="text-[20px] font-extrabold tracking-[-0.03em]"
          titleStyle={{ color: 'var(--text-primary)' }}
        />
      </div>
      <BudgetCarousel />
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesPageInner />
    </Suspense>
  )
}
