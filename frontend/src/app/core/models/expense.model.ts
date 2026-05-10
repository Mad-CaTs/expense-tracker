export interface Expense {
  id: number;
  amount: number;
  description?: string;
  date: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  attachmentCount: number;
}

export interface ExpenseForm {
  amount: number | null;
  description: string;
  date: string;
  categoryId: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: number;
  page?: number;
  size?: number;
}
