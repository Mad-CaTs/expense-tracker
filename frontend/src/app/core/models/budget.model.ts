export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  spent: number;
  percentage: number;
  month: number;
  year: number;
}

export interface BudgetForm {
  categoryId: number;
  amount: number;
  month: number;
  year: number;
}
