'use client'

import { useEffect, useRef, useState } from 'react'

import { getDownloadUrl } from '@/lib/api/attachments'
import { useAttachments, useDeleteAttachment, useDownloadAttachment } from '@/lib/hooks/useAttachments'
import type { Attachment } from '@/types'

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_SIZE = 10 * 1024 * 1024

export interface PendingFile {
  id: string
  file: File
  previewUrl: string | null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType === 'application/pdf') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

interface ExistingRowProps {
  attachment: Attachment
  expenseId: number
}

function ExistingRow({ attachment: a, expenseId }: ExistingRowProps) {
  const remove = useDeleteAttachment(expenseId)
  const download = useDownloadAttachment(expenseId)
  const isImage = a.contentType.startsWith('image/')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isImage) return
    getDownloadUrl(expenseId, a.id).then(setPreviewUrl).catch(() => {})
  }, [expenseId, a.id, isImage])

  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: 'var(--bg-hover)' }}>
      {isImage ? (
        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: 'var(--bg-input)' }}>
          {previewUrl
            ? <img src={previewUrl} alt={a.fileName} className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--accent-light)' }}><FileIcon contentType={a.contentType} /></div>
          }
        </div>
      ) : (
        <span style={{ color: 'var(--accent-light)' }}>
          <FileIcon contentType={a.contentType} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.fileName}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatSize(a.fileSize)}</p>
      </div>
      <button
        type="button"
        onClick={() => download.mutate(a.id)}
        disabled={download.isPending}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
        title="Descargar"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => remove.mutate(a.id)}
        disabled={remove.isPending}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
        title="Eliminar"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
      </button>
    </div>
  )
}

interface PendingRowProps {
  pending: PendingFile
  onRemove: (id: string) => void
}

function PendingRow({ pending, onRemove }: PendingRowProps) {
  const isImage = pending.file.type.startsWith('image/')

  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: 'var(--bg-hover)', outline: '1px solid var(--accent-light)', outlineOffset: '-1px', opacity: 0.9 }}>
      {isImage && pending.previewUrl ? (
        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={pending.previewUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <span style={{ color: 'var(--accent-light)' }}>
          <FileIcon contentType={pending.file.type} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{pending.file.name}</p>
        <p className="text-[10px]" style={{ color: 'var(--accent-light)' }}>Pendiente · {formatSize(pending.file.size)}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(pending.id)}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
        title="Quitar"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

interface AttachmentSectionProps {
  /** Ausente al crear: todavía no hay gasto, solo archivos pendientes. */
  expenseId?: number
  pendingFiles: PendingFile[]
  onAddFiles: (files: PendingFile[]) => void
  onRemovePending: (id: string) => void
}

export function AttachmentSection({ expenseId, pendingFiles, onAddFiles, onRemovePending }: AttachmentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Sin id no hay nada guardado que listar; el hook se desactiva solo con 0.
  const { data: existing = [], isLoading } = useAttachments(expenseId ?? 0)

  const totalCount = existing.length + pendingFiles.length

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const valid = files.filter(f => {
      if (f.size > MAX_SIZE) { alert(`"${f.name}" supera el límite de 10 MB`); return false }
      return true
    })
    const newPending: PendingFile[] = valid.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }))
    onAddFiles(newPending)
    e.target.value = ''
  }

  return (
    <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>
          Adjuntos {totalCount > 0 && `(${totalCount})`}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
          style={{ background: 'var(--bg-hover)', color: 'var(--accent-light)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar
        </button>
        <input ref={fileInputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={handleFileChange} />
      </div>

      {isLoading ? (
        <div className="h-8 animate-pulse rounded-lg" style={{ background: 'var(--bg-hover)' }} />
      ) : totalCount === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-[11px] transition-colors cursor-pointer"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-placeholder)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-placeholder)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Adjuntar recibo o imagen
        </button>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* Solo hay guardados si hay id: la lista viene de consultarlo. */}
          {expenseId != null && existing.map(a => (
            <ExistingRow key={a.id} attachment={a} expenseId={expenseId} />
          ))}
          {pendingFiles.map(p => (
            <PendingRow key={p.id} pending={p} onRemove={onRemovePending} />
          ))}
        </div>
      )}
    </div>
  )
}
