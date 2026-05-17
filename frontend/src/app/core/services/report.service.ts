import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryBreakdown, PeriodType, ReportSummary } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/reports';

  getSummary(period: PeriodType, from?: string, to?: string, categoryId?: number): Observable<ReportSummary> {
    let params = new HttpParams().set('period', period);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (categoryId != null) params = params.set('categoryId', categoryId);
    return this.http.get<ReportSummary>(`${this.base}/summary`, { params });
  }

  getCategoryBreakdown(period: PeriodType, from?: string, to?: string, categoryId?: number): Observable<CategoryBreakdown[]> {
    let params = new HttpParams().set('period', period);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (categoryId != null) params = params.set('categoryId', categoryId);
    return this.http.get<CategoryBreakdown[]>(`${this.base}/by-category`, { params });
  }
}
