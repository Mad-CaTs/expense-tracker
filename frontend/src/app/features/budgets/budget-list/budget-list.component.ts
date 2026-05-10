import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Budget } from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DecimalPipe],
  template: `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 class="page-title">Presupuestos</h1>

        <!-- Selector de mes/año -->
        <div class="flex gap-2">
          <select [(ngModel)]="selectedMonth" (ngModelChange)="load()" class="input-field w-auto"
                  [ngModelOptions]="{standalone: true}">
            <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
          </select>
          <select [(ngModel)]="selectedYear" (ngModelChange)="load()" class="input-field w-auto"
                  [ngModelOptions]="{standalone: true}">
            <option *ngFor="let y of years" [value]="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Formulario nuevo presupuesto -->
      <div class="card p-4">
        <h2 class="section-label">{{ editingId ? 'Editar presupuesto' : 'Nuevo presupuesto' }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="label">Categoría *</label>
              <select formControlName="categoryId" class="input-field">
                <option [ngValue]="null" disabled>Seleccionar...</option>
                <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Límite (S/) *</label>
              <input type="number" formControlName="amount" class="input-field"
                     placeholder="0.00" min="0.01" step="0.01">
            </div>
            <div class="flex items-end gap-2">
              <button type="submit" [disabled]="form.invalid || saving" class="btn-primary flex-1">
                {{ saving ? '...' : (editingId ? 'Actualizar' : 'Agregar') }}
              </button>
              <button *ngIf="editingId" type="button" (click)="cancelEdit()" class="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Lista de presupuestos -->
      <div class="card overflow-hidden">
        <div *ngIf="loading" class="p-8 text-center text-gray-500 text-sm">Cargando...</div>

        <div *ngIf="!loading && budgets.length === 0" class="p-10 text-center">
          <svg class="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-gray-500 text-sm">No hay presupuestos para este período</p>
        </div>

        <ul *ngIf="!loading && budgets.length > 0" class="divide-y divide-gray-800">
          <li *ngFor="let b of budgets" class="px-4 py-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full shrink-0" [style.background-color]="b.categoryColor"></span>
                <span class="font-medium text-gray-100 text-sm">{{ b.categoryName }}</span>
                <span *ngIf="b.percentage >= 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                  SUPERADO
                </span>
                <span *ngIf="b.percentage >= 80 && b.percentage < 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                  ALERTA
                </span>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right hidden sm:block">
                  <span class="text-sm font-bold text-white">S/ {{ b.spent | number:'1.2-2' }}</span>
                  <span class="text-gray-500 text-xs"> / S/ {{ b.amount | number:'1.2-2' }}</span>
                </div>
                <button (click)="startEdit(b)"
                        class="text-blue-400 text-xs font-medium min-h-[40px] min-w-[44px] flex items-center justify-center px-2">
                  Editar
                </button>
                <button (click)="delete(b)"
                        class="text-red-400 text-xs font-medium min-h-[40px] min-w-[44px] flex items-center justify-center px-2">
                  Eliminar
                </button>
              </div>
            </div>

            <!-- Montos en móvil -->
            <div class="flex justify-between text-xs text-gray-400 mb-1.5 sm:hidden">
              <span>S/ {{ b.spent | number:'1.2-2' }} gastado</span>
              <span>S/ {{ b.amount | number:'1.2-2' }} límite</span>
            </div>

            <!-- Barra de progreso -->
            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-500"
                   [style.width.%]="b.percentage"
                   [class.bg-green-500]="b.percentage < 80"
                   [class.bg-yellow-500]="b.percentage >= 80 && b.percentage < 100"
                   [class.bg-red-500]="b.percentage >= 100">
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ b.percentage | number:'1.0-0' }}% utilizado</span>
              <span>S/ {{ (b.amount - b.spent) | number:'1.2-2' }} restante</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class BudgetListComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  budgets: Budget[] = [];
  categories: Category[] = [];
  loading = false;
  saving = false;
  editingId: number | null = null;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear  = new Date().getFullYear();

  months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
  ];

  years = [2024, 2025, 2026, 2027];

  form = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.budgetService.getByPeriod(this.selectedMonth, this.selectedYear).subscribe({
      next: b => { this.budgets = b; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { categoryId, amount } = this.form.value;
    this.budgetService.save({
      categoryId: categoryId!,
      amount: amount!,
      month: this.selectedMonth,
      year: this.selectedYear
    }).subscribe({
      next: () => { this.saving = false; this.resetForm(); this.load(); },
      error: () => { this.saving = false; }
    });
  }

  startEdit(b: Budget): void {
    this.editingId = b.id;
    this.form.patchValue({ categoryId: b.categoryId, amount: b.amount });
  }

  cancelEdit(): void { this.resetForm(); }

  delete(b: Budget): void {
    if (!confirm(`¿Eliminar presupuesto de ${b.categoryName}?`)) return;
    this.budgetService.delete(b.id).subscribe(() => this.load());
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset();
  }
}
