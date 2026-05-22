import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Period } from '@/types'

interface FilterState {
  period: Period
  categoryId?: number
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  currentPage: number
  filtersOpen: boolean
}

interface FilterActions {
  setPeriod: (period: Period) => void
  setCategoryId: (id?: number) => void
  setDateRange: (start?: string, end?: string) => void
  setAmountRange: (min?: number, max?: number) => void
  setPage: (page: number) => void
  toggleFilters: () => void
  resetFilters: () => void
}

const DEFAULT_STATE: FilterState = {
  period: 'MONTHLY',
  categoryId: undefined,
  startDate: undefined,
  endDate: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  currentPage: 0,
  filtersOpen: false,
}

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setPeriod: (period) => set({ period, currentPage: 0 }),
      setCategoryId: (categoryId) => set({ categoryId, currentPage: 0 }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate, currentPage: 0 }),
      setAmountRange: (minAmount, maxAmount) => set({ minAmount, maxAmount, currentPage: 0 }),
      setPage: (currentPage) => set({ currentPage }),
      toggleFilters: () => set((s) => ({ filtersOpen: !s.filtersOpen })),
      resetFilters: () => set(DEFAULT_STATE),
    }),
    {
      name: 'expense-filters',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
)
