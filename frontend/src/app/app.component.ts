import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-950">

      <ng-container *ngIf="showNav">
        <!-- Top bar (desktop) -->
        <nav class="bg-gray-900 border-b border-gray-800 sticky top-0 z-20 shadow-2xl hidden sm:block">
          <div class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span class="text-base font-bold text-white tracking-tight">Gastos</span>
              </div>
              <div class="flex items-center gap-1">
                <a routerLink="/expenses" routerLinkActive="bg-gray-800 text-white"
                   class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 cursor-pointer">
                  Gastos
                </a>
                <a routerLink="/categories" routerLinkActive="bg-gray-800 text-white"
                   class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 cursor-pointer">
                  Categorías
                </a>
                <a routerLink="/reports" routerLinkActive="bg-gray-800 text-white"
                   class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 cursor-pointer">
                  Reportes
                </a>
                <a routerLink="/budgets" routerLinkActive="bg-gray-800 text-white"
                   class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 cursor-pointer">
                  Presupuestos
                </a>
                <a routerLink="/recurring" routerLinkActive="bg-gray-800 text-white"
                   class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 cursor-pointer">
                  Recurrentes
                </a>
                <button (click)="logout()"
                        class="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors duration-150 cursor-pointer"
                        title="Cerrar sesión">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <!-- Mobile top header -->
        <header class="sm:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-20 shadow-xl">
          <div class="flex items-center justify-between px-4 h-14">
            <div class="flex items-center">
              <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mr-2.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-base font-bold text-white tracking-tight">Gastos</span>
            </div>
            <button (click)="logout()"
                    class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors duration-150">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </header>
      </ng-container>

      <main [class]="showNav ? 'flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 pb-24 sm:pb-8' : 'flex-1'">
        <router-outlet />
      </main>

      <!-- Mobile bottom nav -->
      <nav *ngIf="showNav" class="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800"
           style="padding-bottom: env(safe-area-inset-bottom)">
        <div class="flex">
          <a routerLink="/expenses" routerLinkActive="text-blue-400 border-t-2 border-blue-500"
             [routerLinkActiveOptions]="{exact: false}"
             class="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-gray-500 transition-colors duration-150 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="text-[10px] font-medium mt-0.5">Gastos</span>
          </a>
          <a routerLink="/categories" routerLinkActive="text-blue-400 border-t-2 border-blue-500"
             class="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-gray-500 transition-colors duration-150 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"/>
            </svg>
            <span class="text-[10px] font-medium mt-0.5">Categorías</span>
          </a>
          <a routerLink="/reports" routerLinkActive="text-blue-400 border-t-2 border-blue-500"
             class="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-gray-500 transition-colors duration-150 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span class="text-[10px] font-medium mt-0.5">Reportes</span>
          </a>
          <a routerLink="/budgets" routerLinkActive="text-blue-400 border-t-2 border-blue-500"
             class="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-gray-500 transition-colors duration-150 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
            </svg>
            <span class="text-[10px] font-medium mt-0.5">Presupuesto</span>
          </a>
          <a routerLink="/recurring" routerLinkActive="text-blue-400 border-t-2 border-blue-500"
             class="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-gray-500 transition-colors duration-150 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span class="text-[10px] font-medium mt-0.5">Recurrentes</span>
          </a>
        </div>
      </nav>
    </div>
  `
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get showNav(): boolean {
    const url = this.router.url;
    return !url.startsWith('/login') && !url.startsWith('/change-password');
  }

  logout(): void {
    this.authService.logout();
  }
}
