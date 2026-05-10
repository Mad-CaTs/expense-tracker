import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category, AVAILABLE_ICONS } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <h1 class="page-title">Categorías</h1>

      <!-- Formulario inline -->
      <div class="card p-4">
        <h2 class="section-label">
          {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
        </h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div class="col-span-2 sm:flex-1 sm:min-w-36">
              <label class="label">Nombre *</label>
              <input type="text" formControlName="name" class="input-field"
                     [class.input-error]="form.get('name')?.invalid && form.get('name')?.touched"
                     placeholder="Ej: Alimentación">
              <p class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Obligatorio</p>
            </div>
            <div>
              <label class="label">Color *</label>
              <input type="color" formControlName="color" class="h-[44px] w-16 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer p-1 block">
            </div>
            <div class="sm:flex-1 sm:min-w-36">
              <label class="label">Ícono *</label>
              <select formControlName="icon" class="input-field">
                <option *ngFor="let i of icons" [value]="i.value">{{ i.label }}</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="submit" [disabled]="form.invalid || saving" class="btn-primary flex-1 sm:flex-none">
              {{ saving ? '...' : (editingId ? 'Actualizar' : 'Crear') }}
            </button>
            <button *ngIf="editingId" type="button" (click)="cancelEdit()" class="btn-secondary flex-1 sm:flex-none">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista -->
      <div class="card overflow-hidden">
        <div *ngIf="loading" class="p-6 text-center text-gray-500 text-sm">Cargando...</div>
        <ul *ngIf="!loading" class="divide-y divide-gray-800">
          <li *ngFor="let c of categories" class="flex items-center justify-between px-4 py-3.5 hover:bg-gray-800/60 transition-colors duration-150 min-h-[56px]">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    [style.background-color]="c.color">
                {{ c.name[0] }}
              </span>
              <span class="font-medium text-gray-100">{{ c.name }}</span>
              <span class="text-xs text-gray-500">{{ c.icon }}</span>
            </div>
            <div class="flex gap-2">
              <button (click)="startEdit(c)"
                      class="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors duration-150 min-h-[40px] min-w-[44px] flex items-center justify-center px-2">
                Editar
              </button>
              <button (click)="delete(c)"
                      class="text-red-400 hover:text-red-300 text-xs font-medium transition-colors duration-150 min-h-[40px] min-w-[56px] flex items-center justify-center px-2">
                Eliminar
              </button>
            </div>
          </li>
          <li *ngIf="categories.length === 0" class="p-6 text-center text-gray-500 text-sm">
            No hay categorías
          </li>
        </ul>
      </div>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  categories: Category[] = [];
  icons = AVAILABLE_ICONS;
  loading = false;
  saving = false;
  editingId: number | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    color: ['#6366f1', Validators.required],
    icon: ['ellipsis', Validators.required]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: c => { this.categories = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data = this.form.value as { name: string; color: string; icon: string };
    const request = this.editingId
      ? this.categoryService.update(this.editingId, data)
      : this.categoryService.create(data);

    request.subscribe({
      next: () => { this.saving = false; this.resetForm(); this.load(); },
      error: () => { this.saving = false; }
    });
  }

  startEdit(c: Category): void {
    this.editingId = c.id;
    this.form.patchValue({ name: c.name, color: c.color, icon: c.icon });
  }

  cancelEdit(): void { this.editingId = null; this.resetForm(); }

  delete(c: Category): void {
    if (!confirm(`¿Eliminar categoría "${c.name}"?`)) return;
    this.categoryService.delete(c.id).subscribe(() => this.load());
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset({ color: '#6366f1', icon: 'ellipsis' });
  }
}
