import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseFilters, ExpenseForm, PageResponse } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/expenses';

  getAll(filters: ExpenseFilters = {}): Observable<PageResponse<Expense>> {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.page !== undefined) params = params.set('page', filters.page);
    if (filters.size !== undefined) params = params.set('size', filters.size ?? 20);
    return this.http.get<PageResponse<Expense>>(this.base, { params });
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.base}/${id}`);
  }

  create(data: ExpenseForm): Observable<Expense> {
    return this.http.post<Expense>(this.base, data);
  }

  update(id: number, data: ExpenseForm): Observable<Expense> {
    return this.http.put<Expense>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  exportExcel(from?: string, to?: string): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }
}
