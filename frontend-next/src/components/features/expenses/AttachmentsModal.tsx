'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import { getDownloadUrl } from '@/lib/api/attachments'
import { useAttachments } from '@/lib/hooks/useAttachments'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { Attachment } from '@/types'

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AttachmentPreview({ attachment: a, expenseId }: { attachment: Attachment; expenseId: number }) {
  const isImage = a.contentType.startsWith('image/')
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    getDownloadUrl(expenseId, a.id).then(setUrl).catch(() => {})
  }, [expenseId, a.id])

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}>
      {isImage ? (
        <div className="flex h-36 items-center justify-center" style={{ background: 'var(--bg-input)' }}>
          {url
            ? <img src={url} alt={a.fileName} className="h-full w-full object-contain" />
            : <div className="h-6 w-6 animate-pulse rounded-full" style={{ background: 'var(--border-subtle)' }} />
          }
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center" style={{ background: 'var(--bg-input)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="15" y2="17"/>
          </svg>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.fileName}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatSize(a.fileSize)}</p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

interface AttachmentsModalProps {
  expenseId: number
  description: string
  onClose: () => void
}

export function AttachmentsModal({ expenseId, description, onClose }: AttachmentsModalProps) {
  const { data: attachments = [], isLoading } = useAttachments(expenseId)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: MOTION_S.tint, ease: EASE }}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: MOTION_S.layer, ease: EASE }}
          className="w-full max-w-sm overflow-hidden rounded-t-[20px] sm:max-w-2xl sm:rounded-[16px]"
          style={{ background: 'var(--bg-card-inner)', maxHeight: '85dvh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Adjuntos</p>
              <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)', maxWidth: '200px' }}>{description}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full cursor-pointer"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85dvh - 60px)' }}>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 animate-pulse rounded-[14px]" style={{ background: 'var(--bg-hover)' }} />
                ))}
              </div>
            ) : attachments.length === 0 ? (
              <p className="py-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Sin adjuntos</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {attachments.map(a => (
                  <AttachmentPreview key={a.id} attachment={a} expenseId={expenseId} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  )
}
