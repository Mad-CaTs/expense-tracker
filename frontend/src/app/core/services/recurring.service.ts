import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecurringExpense, RecurringExpenseForm } from '../models/recurring.model';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/recurring';

  getAll(): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(this.base);
  }

  create(data: RecurringExpenseForm): Observable<RecurringExpense> {
    return this.http.post<RecurringExpense>(this.base, data);
  }

  toggle(id: number): Observable<RecurringExpense> {
    return this.http.patch<RecurringExpense>(`${this.base}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
