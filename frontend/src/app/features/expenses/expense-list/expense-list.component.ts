import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
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
          <button (click)="exportExcel()" class="btn-secondary flex-1 sm:flex-none">
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
        <div *ngIf="filtersOpen" class="px-4 pb-4 border-t border-gray-800 pt-3">
          <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
            <div class="flex gap-3 flex-1 sm:flex-none">
              <div class="flex-1 sm:w-auto">
                <label class="label">Desde</label>
                <input type="date" [(ngModel)]="filters.from" class="input-field w-full" (change)="applyFilters()">
              </div>
              <div class="flex-1 sm:w-auto">
                <label class="label">Hasta</label>
                <input type="date" [(ngModel)]="filters.to" class="input-field w-full" (change)="applyFilters()">
              </div>
            </div>
            <div class="sm:w-auto">
              <label class="label">Categoría</label>
              <select [(ngModel)]="filters.categoryId" class="input-field w-full" (change)="applyFilters()">
                <option [ngValue]="undefined" class="bg-gray-800">Todas</option>
                <option *ngFor="let c of categories" [ngValue]="c.id" class="bg-gray-800">{{ c.name }}</option>
              </select>
            </div>
            <button *ngIf="activeFilterCount > 0" (click)="clearFilters()" class="btn-secondary sm:self-end text-sm">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla / Cards -->
      <div class="card overflow-hidden">
        <div *ngIf="loading" class="p-10 text-center text-gray-500 text-sm">Cargando...</div>
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
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white shrink-0"
                      [style.background-color]="e.categoryColor">
                  {{ e.categoryName }}
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
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-white"
                        [style.background-color]="e.categoryColor">
                    {{ e.categoryName }}
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

  expenses: Expense[] = [];
  categories: Category[] = [];
  loading = false;
  selectedExpenseId: number | null = null;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  filters: ExpenseFilters = {};
  filtersOpen = false;

  get activeFilterCount(): number {
    return [this.filters.from, this.filters.to, this.filters.categoryId].filter(v => v != null && v !== '').length;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
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

  applyFilters(): void {
    this.currentPage = 0;
    this.loadExpenses();
  }

  clearFilters(): void {
    this.filters = {};
    this.applyFilters();
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
    this.expenseService.delete(expense.id).subscribe(() => this.loadExpenses());
  }

  openAttachments(expense: Expense): void {
    this.selectedExpenseId = expense.id;
  }

  updateAttachmentCount(expenseId: number, count: number): void {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) expense.attachmentCount = count;
  }
}
