'use client'

import { motion } from 'framer-motion'

import type { Expense } from '@/types'

interface ExpenseRowProps {
  expense: Expense
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  index: number
}

export function ExpenseRow({ expense, onEdit, onDelete, index }: ExpenseRowProps) {
  const formattedDate = new Date(expense.date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      className="flex items-center justify-between px-4 py-3.5 border-b border-[#1a1a1a] group hover:bg-[#111] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: `${expense.category.color ?? '#d4af37'}20` }}
        >
          {expense.category.icon ?? '💰'}
        </div>
        <div>
          <p className="text-sm font-medium text-[#e2e0d5]">{expense.description}</p>
          <p className="text-xs text-[#555]">
            {expense.category.name} · {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="tabular-nums text-sm font-bold text-[#e2e0d5]">
          S/ {expense.amount.toFixed(2)}
        </span>
        <div className="hidden group-hover:flex gap-1">
          <button
            onClick={() => onEdit(expense.id)}
            className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#555] hover:text-[#e2e0d5] transition-colors"
            aria-label={`Editar ${expense.description}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1.5 rounded-lg hover:bg-[#ef4444]/10 text-[#555] hover:text-[#ef4444] transition-colors"
            aria-label={`Eliminar ${expense.description}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
