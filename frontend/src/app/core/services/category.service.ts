import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryForm } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/categories';

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  create(data: CategoryForm): Observable<Category> {
    return this.http.post<Category>(this.base, data);
  }

  update(id: number, data: CategoryForm): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
