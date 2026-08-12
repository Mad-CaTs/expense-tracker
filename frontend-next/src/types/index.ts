export interface User {
  id: number
  email: string
  name: string
}

export type CategoryType = 'EXPENSE' | 'INCOME'

export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
  type?: CategoryType
}

export interface Wallet {
  id: number
  name: string
  initialBalance: number
  balance: number
  color?: string
  icon?: string
  backgroundId?: number | null
  backgroundUrl?: string | null
}

export interface CardBackground {
  id: number
  name: string
  imageUrl: string
}

export interface Income {
  id: number
  amount: number
  description?: string
  date: string
  notes?: string
  walletId?: number
  walletName?: string
  categoryId?: number
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
}

export interface IncomePage {
  content: Income[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface Transfer {
  id: number
  amount: number
  description?: string
  date: string
  fromWalletId: number
  fromWalletName: string
  toWalletId: number
  toWalletName: string
  createdAt: string
}

export interface TransferPage {
  content: Transfer[]
  totalElements: number
  totalPages: number
  number: number
  size: number
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
  attachmentCount?: number
  walletId?: number
  walletName?: string
}

export interface ExpensePage {
  content: Expense[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type Period = 'MONTHLY' | 'LAST_MONTH' | 'YEARLY' | 'WEEKLY' | 'CUSTOM'

export interface ExpenseFilters {
  period: Period
  categoryId?: number
  walletId?: number
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
  walletId: number
  walletName?: string
  amount: number
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
  currentIncome?: number
  previousIncome?: number
  netBalance?: number
}

export interface CategoryBreakdown {
  categoryName: string
  total: number
  percentage: number
  count: number
  color?: string
  icon?: string
}

export type RecurringFrequency = 'MONTHLY' | 'WEEKLY' | 'YEARLY'

/** PENDING: espera decisión · PAID: confirmada, generó un gasto ·
 *  SKIPPED: rechazada, queda como deuda pagable. */
export type OccurrenceStatus = 'PENDING' | 'PAID' | 'SKIPPED'

export interface RecurringOccurrence {
  id: number
  recurringId: number
  dueDate: string
  status: OccurrenceStatus
  amount: number
  expenseId?: number
  description: string
  categoryId?: number
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
  walletId?: number
  walletName?: string
}

export interface RecurringExpense {
  id: number
  categoryId: number
  categoryName: string
  categoryColor?: string
  categoryIcon?: string
  walletId: number
  walletName?: string
  amount: number
  description: string
  frequency: RecurringFrequency
  startDate: string
  nextDate: string
  active: boolean
}

export interface CreateRecurringPayload {
  categoryId: number
  walletId: number
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

export interface Attachment {
  id: number
  fileName: string
  contentType: string
  fileSize: number
  createdAt: string
}

export interface ApiError {
  message: string
  status: number
}
