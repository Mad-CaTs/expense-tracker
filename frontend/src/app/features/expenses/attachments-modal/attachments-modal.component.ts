import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentService } from '../../../core/services/attachment.service';
import { Attachment } from '../../../core/models/attachment.model';

@Component({
  selector: 'app-attachments-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="onBackdrop($event)">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 class="text-base font-semibold text-white">Adjuntos</h2>
          <button (click)="close.emit()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5">
          <div *ngIf="loading" class="py-8 text-center text-gray-500 text-sm">Cargando...</div>

          <div *ngIf="!loading && attachments.length === 0" class="py-8 text-center">
            <svg class="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            <p class="text-gray-500 text-sm">Sin adjuntos</p>
          </div>

          <ul *ngIf="!loading && attachments.length > 0" class="space-y-2">
            <li *ngFor="let a of attachments"
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">

              <!-- Thumbnail o ícono -->
              <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-700 flex items-center justify-center"
                   [class.cursor-pointer]="isImage(a) && thumbnails[a.id]"
                   (click)="isImage(a) && thumbnails[a.id] ? openLightbox(thumbnails[a.id], a.fileName) : null">
                <img *ngIf="isImage(a) && thumbnails[a.id]" [src]="thumbnails[a.id]"
                     class="w-full h-full object-cover" [alt]="a.fileName">
                <svg *ngIf="!isImage(a) || !thumbnails[a.id]"
                     class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-200 truncate font-medium">{{ a.fileName }}</p>
                <p class="text-xs text-gray-500">{{ formatSize(a.fileSize) }}</p>
              </div>

              <!-- Acciones -->
              <div class="flex gap-1 shrink-0">
                <button (click)="download(a)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        title="Descargar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </button>
                <button (click)="remove(a)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                        title="Eliminar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div *ngIf="lightboxUrl"
         class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
         (click)="lightboxUrl = null">
      <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              (click)="lightboxUrl = null">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <img [src]="lightboxUrl" [alt]="lightboxAlt"
           class="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
           (click)="$event.stopPropagation()">
    </div>
  `
})
export class AttachmentsModalComponent implements OnInit {
  @Input() expenseId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() countChanged = new EventEmitter<number>();

  private readonly attachmentService = inject(AttachmentService);

  attachments: Attachment[] = [];
  loading = false;
  thumbnails: Record<number, string> = {};
  lightboxUrl: string | null = null;
  lightboxAlt = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.attachmentService.getAll(this.expenseId).subscribe({
      next: list => {
        this.attachments = list;
        this.loading = false;
        list.filter(a => this.isImage(a)).forEach(a => this.loadThumbnail(a));
      },
      error: () => { this.loading = false; }
    });
  }

  loadThumbnail(a: Attachment): void {
    this.attachmentService.presignDownload(this.expenseId, a.id).subscribe(url => {
      this.thumbnails[a.id] = url;
    });
  }

  download(a: Attachment): void {
    this.attachmentService.presignDownload(this.expenseId, a.id).subscribe(url => {
      const link = document.createElement('a');
      link.href = url;
      link.download = a.fileName;
      link.click();
    });
  }

  remove(a: Attachment): void {
    if (!confirm(`¿Eliminar "${a.fileName}"?`)) return;
    this.attachmentService.delete(this.expenseId, a.id).subscribe(() => {
      this.attachments = this.attachments.filter(x => x.id !== a.id);
      this.countChanged.emit(this.attachments.length);
    });
  }

  openLightbox(url: string, fileName: string): void {
    this.lightboxUrl = url;
    this.lightboxAlt = fileName;
  }

  isImage(a: Attachment): boolean {
    return a.contentType.startsWith('image/');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  onBackdrop(event: MouseEvent): void {
    this.close.emit();
  }
}
