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
  leather?: string
  /** PEN | USD | EUR. Solo cambia el símbolo: no hay conversión. */
  currency?: string
  /** true si la billetera ya tiene movimientos: la moneda queda fijada.
   *  Cambiarla reinterpretaría importes ya registrados. */
  currencyLocked?: boolean
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
  createdAt?: string
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
  reimbursableAmount?: number
  createdAt?: string
}

export interface DebtItem {
  personName: string
  amount: number
}

export type DebtDirection = 'THEY_OWE' | 'I_OWE'
export type DebtStatus = 'PENDING' | 'PARTIAL' | 'SETTLED'
/** Deuda suelta: préstamo con efectivo; alguien que pagó por mí (sin billetera:
 *  no toca el saldo hasta que se paga); o yo que pagué por alguien (con billetera:
 *  el dinero salió al pagar y vuelve cuando me paga). */
export type DebtKind = 'LOAN' | 'PAID_FOR_ME' | 'PAID_FOR_THEM'

export interface Debt {
  id: number
  direction: DebtDirection
  kind?: DebtKind
  personName: string
  amount: number
  paidAmount: number
  pending: number
  status: DebtStatus
  expenseId?: number
  walletId?: number
  description?: string
  incurredOn: string
  settledOn?: string
}

export interface DebtPersonGroup {
  personName: string
  pending: number
  debts: Debt[]
}

/** Un abono concreto sobre una deuda pagada por partes. */
export interface DebtPayment {
  id: number
  amount: number
  paidOn: string
  walletId?: number
  walletName?: string
}

export interface DebtSummary {
  theyOwe: number
  iOwe: number
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

export interface DailyTotal {
  date: string
  total: number
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
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
  onboardingCompleted: boolean
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

/** Saldo al cierre de un mes, de una billetera. */
export interface MonthlyBalance {
  /** `yyyy-MM`. */
  month: string
  balance: number
}

/** Guardar resta del saldo disponible de la billetera; sacar lo devuelve. */
export type PiggyMovementType = 'DEPOSIT' | 'WITHDRAWAL'

/** Alcancía: dinero apartado dentro de una billetera. */
export interface PiggyBank {
  id: number
  walletId: number
  name: string
  /** Lo guardado ahora. Se deriva de sus movimientos. */
  balance: number
}

export interface PiggyMovement {
  id: number
  type: PiggyMovementType
  amount: number
  date: string
}

/** Movimiento de alcancía visto desde la billetera (lista de Reportes). */
export interface WalletPiggyMovement extends PiggyMovement {
  piggyBankId: number
  piggyName: string
  createdAt?: string
}
