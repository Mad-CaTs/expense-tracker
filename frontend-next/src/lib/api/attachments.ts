import axios from 'axios'

import { apiClient } from './client'
import type { Attachment } from '@/types'

export function getAttachments(expenseId: number): Promise<Attachment[]> {
  return apiClient.get(`/expenses/${expenseId}/attachments`).then(r => r.data)
}

/**
 * Sube un adjunto en las TRES fases que exige el backend.
 *
 * 1) `presign` reserva la fila en estado PENDING y devuelve la URL firmada.
 * 2) El PUT sube el archivo a R2, fuera de la API.
 * 3) `confirm` verifica el tamaño real subido y lo pasa a CONFIRMED.
 *
 * El paso 3 faltaba, y por eso los archivos "desaparecían": la subida
 * funcionaba —la fila y el objeto quedaban creados— pero `GET /attachments`
 * solo lista los CONFIRMED, así que nunca se veían. Además el código anterior
 * buscaba el recién subido en esa misma lista, donde por definición no estaba.
 */
export async function uploadAttachment(expenseId: number, file: File): Promise<Attachment> {
  const { data } = await apiClient.post(`/expenses/${expenseId}/attachments/presign`, {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })
  await axios.put(data.presignedUrl, file, {
    headers: { 'Content-Type': file.type },
  })
  const confirmed = await apiClient.post<Attachment>(
    `/expenses/${expenseId}/attachments/${data.attachmentId}/confirm`,
  )
  return confirmed.data
}

export async function getDownloadUrl(expenseId: number, attachmentId: number): Promise<string> {
  const { data } = await apiClient.get(`/expenses/${expenseId}/attachments/${attachmentId}/presign-download`)
  return data
}

export function deleteAttachment(expenseId: number, attachmentId: number): Promise<void> {
  return apiClient.delete(`/expenses/${expenseId}/attachments/${attachmentId}`).then(() => undefined)
}
