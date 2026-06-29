import { create } from 'zustand'

export type ActiveSheet =
  | { kind: 'selector' }
  | { kind: 'expense-form'; id?: number }
  | { kind: 'income-form'; id?: number }
  | { kind: 'transfer' }
  | { kind: 'confirm-delete'; id: number; txType: 'expense' | 'income'; label: string }

interface SheetStore {
  active: ActiveSheet | null
  open: (sheet: ActiveSheet) => void
  close: () => void
}

export const useSheetStore = create<SheetStore>((set) => ({
  active: null,
  open: (active) => set({ active }),
  close: () => set({ active: null }),
}))
