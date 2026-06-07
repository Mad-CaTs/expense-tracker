'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'
import { IncomeForm } from '@/components/features/incomes/IncomeForm'

type RecordType = 'expense' | 'income'

export default function NewRecordPage() {
  const [type, setType] = useState<RecordType>('expense')
  const router = useRouter()

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center gap-1 px-2 pt-5 pb-3"
        style={{ background: 'var(--bg-base)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center transition-opacity active:opacity-60 cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Volver"
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
          Nuevo Registro
        </h1>
      </div>

      {/* Tabs 50/50 */}
      <div className="px-4 pb-2">
        <div className="flex rounded-full p-0.5" style={{ background: 'var(--bg-input)' }}>
          {(['expense', 'income'] as RecordType[]).map((t) => (
            <motion.button
              key={t}
              type="button"
              onClick={() => setType(t)}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex-1 rounded-full py-1.5 text-[12px] font-semibold transition-colors"
              style={
                type === t
                  ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {t === 'expense' ? 'Gasto' : 'Ingreso'}
            </motion.button>
          ))}
        </div>
      </div>

      {type === 'expense' ? <ExpenseForm /> : <IncomeForm />}
    </div>
  )
}
