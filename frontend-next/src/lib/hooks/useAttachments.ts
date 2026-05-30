import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteAttachment, getAttachments, getDownloadUrl, uploadAttachment } from '@/lib/api/attachments'

export function useAttachments(expenseId: number) {
  return useQuery({
    queryKey: ['attachments', expenseId],
    queryFn: () => getAttachments(expenseId),
    enabled: expenseId > 0,
  })
}

export function useUploadAttachment(expenseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(expenseId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', expenseId] }),
  })
}

export function useDeleteAttachment(expenseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(expenseId, attachmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', expenseId] }),
  })
}

export function useDownloadAttachment(expenseId: number) {
  return useMutation({
    mutationFn: async (attachmentId: number) => {
      const url = await getDownloadUrl(expenseId, attachmentId)
      window.open(url, '_blank')
    },
  })
}
