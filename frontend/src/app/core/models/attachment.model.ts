export interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface PresignRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignResponse {
  presignedUrl: string;
  attachmentId: number;
}
