'use client'

import {
  Car,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  ShoppingCart,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'

import { ListRow } from '@/components/ui/ListRow'
import { MoneyText } from '@/components/ui/MoneyText'
import { useSheetStore } from '@/stores/sheetStore'
import type { Expense, Income } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'heart-pulse': HeartPulse,
  film: Film,
  home: Home,
  ellipsis: Ellipsis,
  'shopping-cart': ShoppingCart,
  wallet: Wallet,
  zap: Zap,
}

export type MixedTx =
  | { kind: 'expense'; data: Expense }
  | { kind: 'income'; data: Income }

function shortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export function TransactionList({ items }: { items: MixedTx[] }) {
  const open = useSheetStore((s) => s.open)

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isExpense = item.kind === 'expense'
        const tx = item.data
        const color = tx.categoryColor ?? '#d4af37'
        const Icon = tx.categoryIcon ? (ICON_MAP[tx.categoryIcon] ?? Wallet) : Wallet
        const amount = Number(tx.amount ?? 0)

        return (
          <ListRow
            key={`${item.kind}-${tx.id}`}
            index={i}
            Icon={Icon}
            color={color}
            title={tx.description || (isExpense ? 'Gasto' : 'Ingreso')}
            subtitle={`${tx.categoryName ?? 'Sin categoría'} · ${shortDate(tx.date)}`}
            onClick={() => open(isExpense ? { kind: 'expense-form', id: tx.id } : { kind: 'income-form', id: tx.id })}
            trailing={
              <MoneyText
                amount={amount}
                kind={isExpense ? 'expense' : 'income'}
                className="text-[14px] font-bold"
              />
            }
          />
        )
      })}
    </div>
  )
}
