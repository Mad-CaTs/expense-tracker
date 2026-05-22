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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.028, duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="group relative flex items-center justify-between border-b border-[#111] px-4 py-3.5 transition-colors duration-150 hover:bg-[#0e0e0e]"
    >
      <div className="flex items-center gap-3">
        {/* Category icon — double bezel */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[15px]"
          style={{
            backgroundColor: `${expense.category.color ?? '#d4af37'}14`,
            boxShadow: `inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px ${expense.category.color ?? '#d4af37'}18`,
          }}
        >
          {expense.category.icon ?? '💰'}
        </div>
        <div>
          <p className="text-[13px] leading-tight font-medium text-[#e8e6db]">
            {expense.description}
          </p>
          <p className="mt-0.5 text-[11px] text-[#404040]">
            {expense.category.name}
            <span className="mx-1.5 text-[#282828]">·</span>
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="mono-amount text-[13px] font-bold tracking-tight text-[#c8c6bb] transition-colors duration-150 group-hover:text-[#e8e6db]">
          S/{' '}
          <span className="group-hover:text-gold-value transition-colors duration-150">
            {expense.amount.toFixed(2)}
          </span>
        </span>

        {/* Action buttons — reveal on hover */}
        <div className="flex gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={() => onEdit(expense.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#404040] transition-colors duration-100 hover:bg-[#161616] hover:text-[#e8e6db]"
            aria-label={`Editar ${expense.description}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#404040] transition-colors duration-100 hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
            aria-label={`Eliminar ${expense.description}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
