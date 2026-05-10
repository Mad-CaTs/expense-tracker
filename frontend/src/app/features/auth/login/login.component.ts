import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Gastos</h1>
          <p class="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <!-- Card -->
        <div class="card p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="label">Usuario</label>
              <input type="text" formControlName="username"
                     class="input-field" autocomplete="username"
                     placeholder="Tu usuario">
            </div>
            <div>
              <label class="label">Contraseña</label>
              <input type="password" formControlName="password"
                     class="input-field" autocomplete="current-password"
                     placeholder="Tu contraseña">
            </div>

            <div *ngIf="errorMessage" class="text-sm text-red-400 text-center py-1">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="form.invalid || loading" class="btn-primary w-full mt-2">
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      username: this.form.value.username!,
      password: this.form.value.password!
    }).subscribe({
      next: res => {
        if (res.mustChangePassword) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/expenses']);
        }
      },
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}
