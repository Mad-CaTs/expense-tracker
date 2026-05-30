import axios from 'axios'

import { apiClient } from './client'
import type { Attachment } from '@/types'

export function getAttachments(expenseId: number): Promise<Attachment[]> {
  return apiClient.get(`/expenses/${expenseId}/attachments`).then(r => r.data)
}

export async function uploadAttachment(expenseId: number, file: File): Promise<Attachment> {
  const { data } = await apiClient.post(`/expenses/${expenseId}/attachments/presign`, {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })
  await axios.put(data.presignedUrl, file, {
    headers: { 'Content-Type': file.type },
  })
  const attachments = await getAttachments(expenseId)
  return attachments.find(a => a.id === data.attachmentId) ?? attachments[attachments.length - 1]
}

export async function getDownloadUrl(expenseId: number, attachmentId: number): Promise<string> {
  const { data } = await apiClient.get(`/expenses/${expenseId}/attachments/${attachmentId}/presign-download`)
  return data
}

export function deleteAttachment(expenseId: number, attachmentId: number): Promise<void> {
  return apiClient.delete(`/expenses/${expenseId}/attachments/${attachmentId}`).then(() => undefined)
}
