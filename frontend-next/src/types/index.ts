export interface User {
  id: number
  email: string
  name: string
}

export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
}

export interface Expense {
  id: number
  description: string
  amount: number
  date: string
  category: Category
  notes?: string
}

export interface ExpensePage {
  content: Expense[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type Period = 'MONTHLY' | 'LAST_MONTH' | 'YEARLY' | 'CUSTOM'

export interface ExpenseFilters {
  period: Period
  categoryId?: number
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page: number
  size: number
}

export interface Budget {
  id: number
  name: string
  limitAmount: number
  spentAmount: number
  category?: Category
  period: Period
}

export interface ReportSummary {
  totalAmount: number
  previousAmount: number
  changePercent: number
  totalBudget: number
  remainingBudget: number
  categoryBreakdown: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  category: Category
  amount: number
  percentage: number
  transactionCount: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  status: number
}
