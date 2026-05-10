import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RecurringService } from '../../../core/services/recurring.service';
import { CategoryService } from '../../../core/services/category.service';
import { RecurringExpense } from '../../../core/models/recurring.model';
import { Category } from '../../../core/models/category.model';

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: 'Mensual',
  WEEKLY:  'Semanal',
  YEARLY:  'Anual',
};

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="space-y-5">
      <h1 class="page-title">Gastos Recurrentes</h1>

      <!-- Formulario -->
      <div class="card p-4">
        <h2 class="section-label">Nuevo gasto recurrente</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Categoría *</label>
              <select formControlName="categoryId" class="input-field">
                <option [ngValue]="null" disabled>Seleccionar...</option>
                <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Monto (S/) *</label>
              <input type="number" formControlName="amount" class="input-field"
                     placeholder="0.00" min="0.01" step="0.01">
            </div>
            <div>
              <label class="label">Descripción</label>
              <input type="text" formControlName="description" class="input-field"
                     placeholder="Ej: Netflix, Arriendo...">
            </div>
            <div>
              <label class="label">Frecuencia *</label>
              <select formControlName="frequency" class="input-field">
                <option value="MONTHLY">Mensual</option>
                <option value="WEEKLY">Semanal</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
            <div>
              <label class="label">Fecha de inicio *</label>
              <input type="date" formControlName="startDate" class="input-field">
            </div>
          </div>
          <button type="submit" [disabled]="form.invalid || saving" class="btn-primary w-full sm:w-auto">
            {{ saving ? '...' : 'Agregar recurrente' }}
          </button>
        </form>
      </div>

      <!-- Lista -->
      <div class="card overflow-hidden">
        <div *ngIf="loading" class="p-8 text-center text-gray-500 text-sm">Cargando...</div>

        <div *ngIf="!loading && recurring.length === 0" class="p-10 text-center">
          <svg class="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <p class="text-gray-500 text-sm">No hay gastos recurrentes configurados</p>
        </div>

        <ul *ngIf="!loading && recurring.length > 0" class="divide-y divide-gray-800">
          <li *ngFor="let r of recurring"
              class="px-4 py-4 flex items-start justify-between gap-3"
              [class.opacity-50]="!r.active">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <span class="w-3 h-3 rounded-full mt-1 shrink-0" [style.background-color]="r.categoryColor"></span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-gray-100 text-sm">{{ r.description || r.categoryName }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-500/20 text-blue-400">
                    {{ frequencyLabel(r.frequency) }}
                  </span>
                  <span *ngIf="!r.active"
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-700 text-gray-400">
                    PAUSADO
                  </span>
                </div>
                <div class="flex items-center gap-3 mt-1 flex-wrap">
                  <span class="text-gray-500 text-xs">{{ r.categoryName }}</span>
                  <span class="text-white font-bold text-sm">S/ {{ r.amount | number:'1.2-2' }}</span>
                  <span class="text-gray-500 text-xs">
                    Próximo: {{ r.nextDate | date:'dd MMM yyyy' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button (click)="toggle(r)"
                      class="text-xs font-medium min-h-[40px] min-w-[44px] flex items-center justify-center px-2"
                      [class.text-yellow-400]="r.active"
                      [class.text-green-400]="!r.active">
                {{ r.active ? 'Pausar' : 'Activar' }}
              </button>
              <button (click)="delete(r)"
                      class="text-red-400 text-xs font-medium min-h-[40px] min-w-[44px] flex items-center justify-center px-2">
                Eliminar
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Info -->
      <div class="card p-4 border border-blue-800/40 bg-blue-900/10">
        <p class="text-xs text-blue-400 flex items-start gap-2">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Los gastos recurrentes se registran automáticamente cada día a medianoche según su frecuencia.
          Puedes pausarlos temporalmente sin eliminarlos.
        </p>
      </div>
    </div>
  `
})
export class RecurringListComponent implements OnInit {
  private readonly recurringService = inject(RecurringService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  recurring: RecurringExpense[] = [];
  categories: Category[] = [];
  loading = false;
  saving = false;

  form = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
    frequency: ['MONTHLY', Validators.required],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.recurringService.getAll().subscribe({
      next: r => { this.recurring = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    this.recurringService.create({
      categoryId: v.categoryId!,
      amount: v.amount!,
      description: v.description ?? '',
      frequency: v.frequency!,
      startDate: v.startDate!,
    }).subscribe({
      next: () => { this.saving = false; this.form.reset({ frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0] }); this.load(); },
      error: () => { this.saving = false; }
    });
  }

  toggle(r: RecurringExpense): void {
    this.recurringService.toggle(r.id).subscribe(() => this.load());
  }

  delete(r: RecurringExpense): void {
    if (!confirm(`¿Eliminar "${r.description || r.categoryName}" recurrente?`)) return;
    this.recurringService.delete(r.id).subscribe(() => this.load());
  }

  frequencyLabel(f: string): string {
    return FREQUENCY_LABELS[f] ?? f;
  }
}
