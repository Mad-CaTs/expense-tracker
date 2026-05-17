import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(message: string, durationMs = 3000): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4000): void {
    this.show(message, 'error', durationMs);
  }

  private show(message: string, type: 'success' | 'error', durationMs: number): void {
    const id = ++this.nextId;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
