import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attachment, PresignRequest, PresignResponse } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly http = inject(HttpClient);

  private base(expenseId: number): string {
    return `/api/expenses/${expenseId}/attachments`;
  }

  getAll(expenseId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(this.base(expenseId));
  }

  presign(expenseId: number, req: PresignRequest): Observable<PresignResponse> {
    return this.http.post<PresignResponse>(`${this.base(expenseId)}/presign`, req);
  }

  presignDownload(expenseId: number, attachmentId: number): Observable<string> {
    return this.http.get(`${this.base(expenseId)}/${attachmentId}/presign-download`, {
      responseType: 'text'
    });
  }

  delete(expenseId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(expenseId)}/${attachmentId}`);
  }

  uploadToR2(presignedUrl: string, file: File, onProgress: (pct: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 upload failed: ${xhr.status}`));
      xhr.onerror = () => reject(new Error('R2 upload network error'));
      xhr.send(file);
    });
  }
}
