import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetForm } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/budgets';

  getByPeriod(month: number, year: number): Observable<Budget[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Budget[]>(this.base, { params });
  }

  save(data: BudgetForm): Observable<Budget> {
    return this.http.post<Budget>(this.base, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
