import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl) {
  const parent = control.parent;
  if (!parent) return null;
  return parent.get('newPassword')?.value === control.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-8">
          <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Cambia tu contraseña</h1>
          <p class="text-gray-500 text-sm mt-1 text-center">Por seguridad, debes crear una contraseña propia</p>
        </div>

        <div class="card p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="label">Contraseña actual</label>
              <input type="password" formControlName="currentPassword"
                     class="input-field" autocomplete="current-password"
                     placeholder="Contraseña que te dieron">
            </div>
            <div>
              <label class="label">Nueva contraseña</label>
              <input type="password" formControlName="newPassword"
                     class="input-field" autocomplete="new-password"
                     placeholder="Mínimo 6 caracteres"
                     [class.input-error]="form.get('newPassword')?.invalid && form.get('newPassword')?.touched">
              <p class="error-message" *ngIf="form.get('newPassword')?.errors?.['minlength'] && form.get('newPassword')?.touched">
                Mínimo 6 caracteres
              </p>
            </div>
            <div>
              <label class="label">Confirmar contraseña</label>
              <input type="password" formControlName="confirmPassword"
                     class="input-field" autocomplete="new-password"
                     placeholder="Repite la nueva contraseña"
                     [class.input-error]="form.get('confirmPassword')?.errors?.['mismatch'] && form.get('confirmPassword')?.touched">
              <p class="error-message" *ngIf="form.get('confirmPassword')?.errors?.['mismatch'] && form.get('confirmPassword')?.touched">
                Las contraseñas no coinciden
              </p>
            </div>

            <div *ngIf="errorMessage" class="text-sm text-red-400 text-center py-1">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="form.invalid || loading" class="btn-primary w-full mt-2">
              {{ loading ? 'Guardando...' : 'Guardar y continuar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, passwordsMatch]]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';

    this.authService.changePassword({
      currentPassword: this.form.value.currentPassword!,
      newPassword: this.form.value.newPassword!
    }).subscribe({
      next: () => this.router.navigate(['/expenses']),
      error: () => {
        this.errorMessage = 'La contraseña actual es incorrecta';
        this.loading = false;
      }
    });
  }
}
