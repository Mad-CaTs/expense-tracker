import { isAxiosError } from 'axios'

/**
 * El motivo que dio el servidor (`detail` del ProblemDetail), o `fallback`.
 *
 * Las reglas de negocio ("no puedes guardar más de lo disponible") viven en el
 * backend y su mensaje ya está escrito para el usuario: repetirlas en el
 * cliente las duplicaría.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail
    if (detail) return detail
  }
  return fallback
}
