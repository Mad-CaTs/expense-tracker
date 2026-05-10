import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { changePasswordGuard } from './core/guards/change-password.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'expenses', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'change-password',
    canActivate: [changePasswordGuard],
    loadComponent: () =>
      import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },
  {
    path: 'expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
  },
  {
    path: 'expenses/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/expenses/expense-form/expense-form.component').then(m => m.ExpenseFormComponent)
  },
  {
    path: 'expenses/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/expenses/expense-form/expense-form.component').then(m => m.ExpenseFormComponent)
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reports/report-dashboard/report-dashboard.component').then(m => m.ReportDashboardComponent)
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/budgets/budget-list/budget-list.component').then(m => m.BudgetListComponent)
  },
  {
    path: 'recurring',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/recurring/recurring-list/recurring-list.component').then(m => m.RecurringListComponent)
  },
  { path: '**', redirectTo: 'login' }
];
