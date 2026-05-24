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
  categoryId: number
  categoryName: string
  categoryColor?: string
  categoryIcon?: string
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
  categoryId?: number
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
  amount: number
  month: number
  year: number
  spent: number
  percentage: number
}

export interface ReportSummary {
  currentTotal: number
  previousTotal: number
  changePercentage: number
  dailyAverage: number
  period: string
  currentFrom: string
  currentTo: string
  previousFrom: string
  previousTo: string
}

export interface CategoryBreakdown {
  categoryName: string
  total: number
  percentage: number
  count: number
}

export type RecurringFrequency = 'MONTHLY' | 'WEEKLY' | 'YEARLY'

export interface RecurringExpense {
  id: number
  categoryId: number
  categoryName: string
  categoryColor?: string
  categoryIcon?: string
  amount: number
  description: string
  frequency: RecurringFrequency
  startDate: string
  nextDate: string
  active: boolean
}

export interface CreateRecurringPayload {
  categoryId: number
  amount: number
  description: string
  frequency: RecurringFrequency
  startDate: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  mustChangePassword: boolean
  username: string
  user: User
}

export interface ApiError {
  message: string
  status: number
}
