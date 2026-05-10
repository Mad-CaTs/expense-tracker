import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryBreakdown, PeriodType, ReportSummary } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/reports';

  getSummary(period: PeriodType, from?: string, to?: string): Observable<ReportSummary> {
    let params = new HttpParams().set('period', period);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ReportSummary>(`${this.base}/summary`, { params });
  }

  getCategoryBreakdown(from?: string, to?: string): Observable<CategoryBreakdown[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<CategoryBreakdown[]>(`${this.base}/by-category`, { params });
  }
}
