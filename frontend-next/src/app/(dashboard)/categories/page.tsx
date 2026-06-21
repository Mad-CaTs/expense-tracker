'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'

import { CategoriesManager } from '@/components/features/categories/CategoriesManager'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import type { CategoryType } from '@/types'

const TABS: { type: CategoryType; label: string }[] = [
  { type: 'EXPENSE', label: 'Gasto' },
  { type: 'INCOME', label: 'Ingreso' },
]

function monthRange() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(last)}`
  return { from, to }
}

export default function CategoriesPage() {
  const router = useRouter()
  const { data: categories, isLoading } = useCategories()
  const [activeType, setActiveType] = useState<CategoryType>('EXPENSE')

  const { from, to } = useMemo(monthRange, [])
  const { data: breakdown } = useCategoryBreakdown({ period: 'CUSTOM', from, to, txType: activeType })

  const filtered = (categories ?? [])
    .filter((c) => activeType === 'INCOME' ? c.type === 'INCOME' : c.type !== 'INCOME')
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))

  const usageByName = useMemo(() => {
    const map: Record<string, { total: number; count: number; percentage: number }> = {}
    for (const b of breakdown ?? []) {
      map[b.categoryName] = { total: b.total ?? 0, count: b.count ?? 0, percentage: b.percentage ?? 0 }
    }
    return map
  }, [breakdown])

  const monthTotal = (breakdown ?? []).reduce((s, b) => s + (b.total ?? 0), 0)
  const topCategory = (breakdown ?? []).reduce<{ categoryName: string; total: number } | null>(
    (top, b) => (!top || (b.total ?? 0) > top.total ? { categoryName: b.categoryName, total: b.total ?? 0 } : top),
    null
  )
  const isExpense = activeType === 'EXPENSE'

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      <SubPageHeader title="Categorías" />

      <div className="px-4">
        {/* Segmented Gasto | Ingreso */}
        <div className="mb-4 flex gap-1.5">
          {TABS.map(({ type, label }) => (
            <motion.button
              key={type}
              onClick={() => setActiveType(type)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors"
              style={
                activeType === type
                  ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
                  : { background: 'var(--bg-input)', color: 'var(--text-muted)' }
              }
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="mb-4 grid grid-cols-3 gap-2"
        >
          <SummaryStat label={isExpense ? 'Gastado' : 'Recibido'} value={`S/ ${monthTotal.toFixed(0)}`} accent />
          <SummaryStat label="Top" value={topCategory && topCategory.total > 0 ? topCategory.categoryName : '—'} />
          <SummaryStat label="Categorías" value={String(filtered.length)} />
        </motion.div>

        <CategoriesManager
          key={`mgr-${activeType}`}
          type={activeType}
          categories={filtered}
          isLoading={isLoading}
          deleteDescription={
            isExpense
              ? 'Los gastos asociados perderán su categoría.'
              : 'Los ingresos asociados perderán su categoría.'
          }
          usageByName={usageByName}
          onNavigate={isExpense ? (id) => router.push(`/expenses?categoryId=${id}`) : undefined}
        />
      </div>
    </div>
  )
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[14px] border px-3 py-2.5"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
    >
      <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        {label}
      </p>
      <p
        className="mono-amount mt-1 truncate font-extrabold leading-none tracking-tight"
        style={{ color: accent ? 'var(--accent-light)' : 'var(--text-primary)', fontSize: 'clamp(11px, 3.2vw, 15px)' }}
      >
        {value}
      </p>
    </div>
  )
}
