import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Expense, ExpenseFilters } from '../../../core/models/expense.model';
import { Category } from '../../../core/models/category.model';
import { AttachmentsModalComponent } from '../attachments-modal/attachments-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, DecimalPipe, AttachmentsModalComponent],
  template: `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 class="page-title">Registro de Gastos</h1>
        <div class="flex gap-2">
          <button (click)="exportExcel()" class="btn-secondary flex-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Excel
          </button>
          <a routerLink="/expenses/new" class="btn-primary flex-1 sm:flex-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo gasto
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card overflow-hidden">
        <!-- Header siempre visible -->
        <button type="button" (click)="filtersOpen = !filtersOpen"
                class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/40 transition-colors">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <span class="text-sm font-medium text-gray-300">Filtros</span>
            <span *ngIf="activeFilterCount > 0"
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {{ activeFilterCount }}
            </span>
          </div>
          <svg class="w-4 h-4 text-gray-500 transition-transform duration-200"
               [class.rotate-180]="filtersOpen"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Panel colapsable -->
        <div *ngIf="filtersOpen" class="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
          <!-- Fila 1: período + categoría -->
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex gap-2 flex-wrap flex-1">
              <button *ngFor="let p of periods"
                      (click)="setPeriod(p.value)"
                      [class]="period === p.value ? 'btn-primary' : 'btn-secondary'"
                      class="text-xs">
                {{ p.label }}
              </button>
            </div>
            <div class="flex gap-2 items-end shrink-0">
              <div>
                <label class="label">Categoría</label>
                <select [(ngModel)]="filters.categoryId" class="input-field" (change)="applyFilters()">
                  <option [ngValue]="undefined" class="bg-gray-800">Todas</option>
                  <option *ngFor="let c of categories" [ngValue]="c.id" class="bg-gray-800">{{ c.name }}</option>
                </select>
              </div>
              <button *ngIf="filters.categoryId != null" (click)="filters.categoryId = undefined; applyFilters()" class="btn-secondary text-sm self-end">
                Limpiar
              </button>
            </div>
          </div>
          <!-- Fila 2: Desde/Hasta — solo con Personalizado -->
          <div *ngIf="period === 'CUSTOM'" class="flex gap-3">
            <div class="flex-1">
              <label class="label">Desde</label>
              <input type="date" [(ngModel)]="filters.from" class="input-field w-full" (change)="applyFilters()">
            </div>
            <div class="flex-1">
              <label class="label">Hasta</label>
              <input type="date" [(ngModel)]="filters.to" class="input-field w-full" (change)="applyFilters()">
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla / Cards -->
      <div class="card overflow-hidden">
        <div *ngIf="loading" class="space-y-2 p-4">
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-12 w-3/4"></div>
        </div>
        <div *ngIf="!loading && expenses.length === 0" class="p-12 text-center">
          <svg class="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-gray-500 text-sm">No hay gastos en este período</p>
          <a routerLink="/expenses/new" class="btn-primary mt-4 inline-flex">Agregar primer gasto</a>
        </div>

        <!-- Mobile: card list -->
        <ul *ngIf="!loading && expenses.length > 0" class="sm:hidden divide-y divide-gray-800">
          <li *ngFor="let e of expenses" class="px-4 py-3.5 flex items-start justify-between gap-3 active:bg-gray-800/60">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="category-badge shrink-0" [style.backgroundColor]="(e.categoryColor || '#4d6080') + '22'">
                  <span class="category-badge-dot" [style.backgroundColor]="e.categoryColor || '#4d6080'"></span>
                  <span [style.color]="e.categoryColor || '#4d6080'">{{ e.categoryName || 'Sin categoría' }}</span>
                </span>
                <span class="text-xs text-gray-500 shrink-0">{{ e.date | date:'dd MMM' }}</span>
              </div>
              <p class="text-sm text-gray-300 truncate">{{ e.description || '—' }}</p>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
              <span class="text-base font-bold text-white">S/ {{ e.amount | number:'1.2-2' }}</span>
              <div class="flex gap-3">
                <button *ngIf="e.attachmentCount > 0"
                        (click)="openAttachments(e)"
                        class="text-gray-400 text-xs font-medium min-h-[32px] flex items-center gap-1 px-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  {{ e.attachmentCount }}
                </button>
                <a [routerLink]="['/expenses', e.id, 'edit']"
                   class="text-blue-400 text-xs font-medium min-h-[32px] flex items-center px-1">Editar</a>
                <button (click)="delete(e)"
                   class="text-red-400 text-xs font-medium min-h-[32px] flex items-center px-1">Eliminar</button>
              </div>
            </div>
          </li>
        </ul>

        <!-- Desktop: table -->
        <div *ngIf="!loading && expenses.length > 0" class="hidden sm:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-800 border-b border-gray-700">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Monto</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr *ngFor="let e of expenses" class="hover:bg-gray-800/60 transition-colors duration-150">
                <td class="px-5 py-3.5 text-gray-400 whitespace-nowrap">{{ e.date | date:'dd MMM yyyy' }}</td>
                <td class="px-5 py-3.5">
                  <span class="category-badge" [style.backgroundColor]="(e.categoryColor || '#4d6080') + '22'">
                    <span class="category-badge-dot" [style.backgroundColor]="e.categoryColor || '#4d6080'"></span>
                    <span [style.color]="e.categoryColor || '#4d6080'">{{ e.categoryName || 'Sin categoría' }}</span>
                  </span>
                </td>
                <td class="px-5 py-3.5 text-gray-400 max-w-xs truncate">{{ e.description || '—' }}</td>
                <td class="px-5 py-3.5 text-right font-semibold text-white">
                  S/ {{ e.amount | number:'1.2-2' }}
                </td>
                <td class="px-5 py-3.5 text-right">
                  <div class="flex justify-end gap-3">
                    <button *ngIf="e.attachmentCount > 0"
                            (click)="openAttachments(e)"
                            class="text-gray-400 hover:text-white text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors duration-150">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      {{ e.attachmentCount }}
                    </button>
                    <a [routerLink]="['/expenses', e.id, 'edit']"
                       class="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer transition-colors duration-150">Editar</a>
                    <button (click)="delete(e)"
                       class="text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer transition-colors duration-150">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div *ngIf="totalPages > 1" class="px-4 py-3 border-t border-gray-800 flex items-center justify-between bg-gray-800/40">
          <span class="text-xs text-gray-500">{{ totalElements }} gastos</span>
          <div class="flex items-center gap-2">
            <button [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)"
                    class="btn-secondary min-h-[40px] px-4 text-xs disabled:opacity-40">← Ant.</button>
            <span class="text-xs font-medium text-gray-400 px-1">{{ currentPage + 1 }} / {{ totalPages }}</span>
            <button [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)"
                    class="btn-secondary min-h-[40px] px-4 text-xs disabled:opacity-40">Sig. →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB mobile -->
    <a routerLink="/expenses/new"
       class="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 flex items-center justify-center rounded-2xl text-white"
       style="background-color:#005bd3;box-shadow:0 4px 20px #005bd360">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </a>

    <app-attachments-modal
      *ngIf="selectedExpenseId !== null"
      [expenseId]="selectedExpenseId!"
      (close)="selectedExpenseId = null"
      (countChanged)="updateAttachmentCount(selectedExpenseId!, $event)">
    </app-attachments-modal>
  `
})
export class ExpenseListComponent implements OnInit {
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);

  expenses: Expense[] = [];
  categories: Category[] = [];
  loading = false;
  selectedExpenseId: number | null = null;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  filters: ExpenseFilters = {};
  filtersOpen = false;
  period = 'MONTHLY';

  periods = [
    { value: 'DAILY',   label: 'Hoy' },
    { value: 'WEEKLY',  label: 'Esta semana' },
    { value: 'MONTHLY', label: 'Este mes' },
    { value: 'YEARLY',  label: 'Este año' },
    { value: 'ALL',     label: 'Todo' },
    { value: 'CUSTOM',  label: 'Personalizado' },
  ];

  get activeFilterCount(): number {
    return this.filters.categoryId != null ? 1 : 0;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setPeriod('MONTHLY');
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getAll({ ...this.filters, page: this.currentPage, size: 20 })
      .subscribe({
        next: page => {
          this.expenses = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  setPeriod(p: string): void {
    this.period = p;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

    switch (p) {
      case 'DAILY':
        this.filters.from = today; this.filters.to = today; break;
      case 'WEEKLY':
        this.filters.from = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
        this.filters.to = today; break;
      case 'MONTHLY':
        this.filters.from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        this.filters.to = today; break;
      case 'YEARLY':
        this.filters.from = `${now.getFullYear()}-01-01`;
        this.filters.to = today; break;
      case 'ALL':
        this.filters.from = '2000-01-01'; this.filters.to = today; break;
      case 'CUSTOM':
        this.filters.from = undefined; this.filters.to = undefined; break;
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadExpenses();
  }

  clearFilters(): void {
    this.filters = {};
    this.period = 'MONTHLY';
    this.setPeriod('MONTHLY');
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadExpenses();
  }

  exportExcel(): void {
    this.expenseService.exportExcel(this.filters.from, this.filters.to).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gastos.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  delete(expense: Expense): void {
    if (!confirm(`¿Eliminar gasto de S/ ${expense.amount}?`)) return;
    this.expenseService.delete(expense.id).subscribe({
      next: () => { this.toastService.success('Gasto eliminado'); this.loadExpenses(); },
      error: () => { this.toastService.error('Error al eliminar el gasto'); }
    });
  }

  openAttachments(expense: Expense): void {
    this.selectedExpenseId = expense.id;
  }

  updateAttachmentCount(expenseId: number, count: number): void {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) expense.attachmentCount = count;
  }
}
