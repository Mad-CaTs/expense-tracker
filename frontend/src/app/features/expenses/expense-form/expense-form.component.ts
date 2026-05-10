import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { AttachmentService } from '../../../core/services/attachment.service';
import { Attachment } from '../../../core/models/attachment.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-lg mx-auto space-y-4">
      <div class="flex items-center gap-3">
        <button (click)="goBack()"
                class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 -ml-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="page-title">
          {{ isEditMode ? 'Editar gasto' : 'Nuevo gasto' }}
        </h1>
      </div>

      <div class="card p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="label">Monto *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-400">$</span>
              <input type="number" step="0.01" min="0.01" formControlName="amount"
                     class="input-field pl-7"
                     [class.input-error]="form.get('amount')?.invalid && form.get('amount')?.touched"
                     placeholder="0.00">
            </div>
            <p class="error-message" *ngIf="form.get('amount')?.errors?.['required'] && form.get('amount')?.touched">
              El monto es obligatorio
            </p>
            <p class="error-message" *ngIf="form.get('amount')?.errors?.['min'] && form.get('amount')?.touched">
              El monto debe ser mayor a 0
            </p>
          </div>

          <div>
            <label class="label">Fecha *</label>
            <input type="date" formControlName="date"
                   class="input-field"
                   [class.input-error]="form.get('date')?.invalid && form.get('date')?.touched">
            <p class="error-message" *ngIf="form.get('date')?.invalid && form.get('date')?.touched">
              La fecha es obligatoria
            </p>
          </div>

          <div>
            <label class="label">Categoría *</label>
            <select formControlName="categoryId"
                    class="input-field"
                    [class.input-error]="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
              <option value="">Seleccionar categoría</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
            <p class="error-message" *ngIf="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
              La categoría es obligatoria
            </p>
          </div>

          <div>
            <label class="label">Descripción</label>
            <textarea formControlName="description"
                      class="input-field resize-none"
                      rows="3"
                      placeholder="Descripción opcional..."></textarea>
          </div>

          <!-- Adjuntos en modo creación -->
          <div *ngIf="!isEditMode" class="space-y-2">
            <label class="label">Adjuntos</label>
            <ul *ngIf="pendingFiles.length > 0" class="space-y-1.5 mb-2">
              <li *ngFor="let f of pendingFiles; let i = index"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <span class="flex-1 text-sm text-gray-300 truncate">{{ f.name }}</span>
                <span class="text-xs text-gray-500 shrink-0">{{ formatSize(f.size) }}</span>
                <button type="button" (click)="removePending(i)"
                        class="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-red-400 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </li>
            </ul>
            <label class="btn-secondary cursor-pointer inline-flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              Agregar archivo
              <input type="file" class="hidden"
                     accept="image/jpeg,image/png,image/webp,application/pdf"
                     multiple
                     (change)="onPendingFileSelected($event)">
            </label>
            <p class="text-xs text-gray-600">Formatos: JPG, PNG, WEBP, PDF · Máx. 10 MB</p>
            <p *ngIf="pendingError" class="text-xs text-red-400">{{ pendingError }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" [disabled]="form.invalid || saving" class="btn-primary flex-1">
              {{ saving ? (uploadingCount > 0 ? 'Subiendo ' + uploadingCount + ' archivo(s)...' : 'Guardando...') : (isEditMode ? 'Actualizar' : 'Crear gasto') }}
            </button>
            <button type="button" (click)="goBack()" class="btn-secondary sm:w-auto">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Sección adjuntos — visible cuando el gasto ya existe -->
      <div *ngIf="expenseId" class="card p-6 space-y-4">
        <h2 class="section-label">Adjuntos</h2>

        <!-- Lista -->
        <ul *ngIf="attachments.length > 0" class="space-y-2">
          <li *ngFor="let a of attachments"
              class="flex items-center gap-3 p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">
            <div class="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden"
                 [class.cursor-pointer]="isImage(a) && thumbnails[a.id]"
                 (click)="isImage(a) && thumbnails[a.id] ? openLightbox(thumbnails[a.id], a.fileName) : null">
              <img *ngIf="isImage(a) && thumbnails[a.id]" [src]="thumbnails[a.id]"
                   class="w-full h-full object-cover" [alt]="a.fileName">
              <svg *ngIf="!isImage(a) || !thumbnails[a.id]"
                   class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-200 truncate font-medium">{{ a.fileName }}</p>
              <p class="text-xs text-gray-500">{{ formatSize(a.fileSize) }}</p>
            </div>
            <div class="flex gap-1 shrink-0">
              <button (click)="downloadAttachment(a)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                      title="Descargar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <button (click)="removeAttachment(a)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                      title="Eliminar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </li>
        </ul>

        <!-- Barra de progreso -->
        <div *ngIf="uploadProgress !== null" class="space-y-1">
          <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-200 rounded-full"
                 [style.width.%]="uploadProgress"></div>
          </div>
          <p class="text-xs text-gray-500">Subiendo... {{ uploadProgress }}%</p>
        </div>

        <!-- Error -->
        <p *ngIf="uploadError" class="text-xs text-red-400">{{ uploadError }}</p>

        <!-- Botón agregar -->
        <div>
          <label class="btn-secondary cursor-pointer inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                 [class.opacity-50]="uploadProgress !== null">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            Agregar archivo
            <input type="file" class="hidden"
                   accept="image/jpeg,image/png,image/webp,application/pdf"
                   [disabled]="uploadProgress !== null"
                   (change)="onFileSelected($event)">
          </label>
          <p class="text-xs text-gray-600 mt-1.5">Formatos: JPG, PNG, WEBP, PDF · Máx. 10 MB</p>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div *ngIf="lightboxUrl"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
         (click)="lightboxUrl = null">
      <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              (click)="lightboxUrl = null">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <img [src]="lightboxUrl" [alt]="lightboxAlt"
           class="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
           (click)="$event.stopPropagation()">
    </div>
  `
})
export class ExpenseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly attachmentService = inject(AttachmentService);

  categories: Category[] = [];
  saving = false;
  isEditMode = false;
  expenseId?: number;

  attachments: Attachment[] = [];
  thumbnails: Record<number, string> = {};
  uploadProgress: number | null = null;
  uploadError: string | null = null;
  lightboxUrl: string | null = null;
  lightboxAlt = '';

  pendingFiles: File[] = [];
  pendingError: string | null = null;
  uploadingCount = 0;

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [this.todayLocal(), Validators.required],
    categoryId: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.expenseId = +id;
      this.loadAttachments();
      this.expenseService.getById(this.expenseId).subscribe(expense => {
        this.form.patchValue({
          amount: expense.amount,
          date: expense.date,
          categoryId: String(expense.categoryId),
          description: expense.description ?? ''
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data = {
      amount: this.form.value.amount!,
      date: this.form.value.date!,
      categoryId: Number(this.form.value.categoryId),
      description: this.form.value.description ?? ''
    };

    const request = this.isEditMode
      ? this.expenseService.update(this.expenseId!, data)
      : this.expenseService.create(data);

    request.subscribe({
      next: async (result) => {
        if (this.isEditMode) {
          this.router.navigate(['/expenses']);
        } else {
          if (this.pendingFiles.length > 0) {
            await this.uploadPendingFiles(result.id);
          }
          this.router.navigate(['/expenses']);
        }
      },
      error: () => { this.saving = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/expenses']);
  }

  onPendingFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const MAX = 10_485_760;
    this.pendingError = null;
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        this.pendingError = `"${file.name}": tipo no permitido. Usa JPG, PNG, WEBP o PDF.`;
        continue;
      }
      if (file.size > MAX) {
        this.pendingError = `"${file.name}": supera el límite de 10 MB.`;
        continue;
      }
      this.pendingFiles.push(file);
    }
    input.value = '';
  }

  removePending(index: number): void {
    this.pendingFiles.splice(index, 1);
  }

  async uploadPendingFiles(expenseId: number): Promise<void> {
    this.uploadingCount = this.pendingFiles.length;
    for (const file of this.pendingFiles) {
      await new Promise<void>(resolve => {
        this.attachmentService.presign(expenseId, {
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        }).subscribe({
          next: async (res) => {
            try {
              await this.attachmentService.uploadToR2(res.presignedUrl, file, () => {});
            } catch {
              this.attachmentService.delete(expenseId, res.attachmentId).subscribe();
            }
            this.uploadingCount--;
            resolve();
          },
          error: () => { this.uploadingCount--; resolve(); }
        });
      });
    }
    this.pendingFiles = [];
  }

  loadAttachments(): void {
    if (!this.expenseId) return;
    this.attachmentService.getAll(this.expenseId).subscribe(list => {
      this.attachments = list;
      list.filter(a => this.isImage(a)).forEach(a => this.loadThumbnail(a));
    });
  }

  loadThumbnail(a: Attachment): void {
    if (this.thumbnails[a.id]) return;
    this.attachmentService.presignDownload(this.expenseId!, a.id).subscribe(url => {
      this.thumbnails[a.id] = url;
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const MAX = 10_485_760;

    if (!ALLOWED.includes(file.type)) {
      this.uploadError = 'Tipo no permitido. Usa JPG, PNG, WEBP o PDF.';
      return;
    }
    if (file.size > MAX) {
      this.uploadError = 'El archivo supera el límite de 10 MB.';
      return;
    }

    this.uploadError = null;
    this.uploadProgress = 0;

    this.attachmentService.presign(this.expenseId!, {
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size
    }).subscribe({
      next: async (res) => {
        try {
          await this.attachmentService.uploadToR2(res.presignedUrl, file, pct => {
            this.uploadProgress = pct;
          });
          this.uploadProgress = null;
          this.loadAttachments();
        } catch {
          this.uploadProgress = null;
          this.uploadError = 'Error al subir el archivo. Intenta de nuevo.';
          this.attachmentService.delete(this.expenseId!, res.attachmentId).subscribe();
        }
        input.value = '';
      },
      error: (err) => {
        this.uploadProgress = null;
        this.uploadError = err?.error?.error ?? 'Error al obtener URL de subida.';
      }
    });
  }

  removeAttachment(a: Attachment): void {
    if (!confirm(`¿Eliminar "${a.fileName}"?`)) return;
    this.attachmentService.delete(this.expenseId!, a.id).subscribe(() => {
      this.attachments = this.attachments.filter(x => x.id !== a.id);
    });
  }

  downloadAttachment(a: Attachment): void {
    this.attachmentService.presignDownload(this.expenseId!, a.id).subscribe(url => {
      const link = document.createElement('a');
      link.href = url;
      link.download = a.fileName;
      link.click();
    });
  }

  openLightbox(url: string, fileName: string): void {
    this.lightboxUrl = url;
    this.lightboxAlt = fileName;
  }

  isImage(a: Attachment): boolean {
    return a.contentType.startsWith('image/');
  }

  private todayLocal(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }
}
