export interface RecurringExpense {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  amount: number;
  description: string;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate: string;
  nextDate: string;
  active: boolean;
}

export interface RecurringExpenseForm {
  categoryId: number;
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
}
