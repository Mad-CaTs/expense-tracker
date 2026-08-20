'use client'

import type { ReportTxType } from '@/components/features/reports/ReportFilters'
import type { Granularity } from '@/components/features/reports/usePeriodRange'

export interface ReportScope {
  walletId: number | null
  txType: ReportTxType
  categoryIds: number[]
  granularity: Granularity
  periodDate: Date
  isCustom: boolean
  range: { from: string; to: string }
}

/** Primero del mes: el período se identifica por su mes, no por el día. */
function monthStamp(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Serializa lo que se está mirando en un reporte.
 *
 * Vive acá porque /reports lo escribe y /reports/analytics lo lee: con el
 * formato duplicado en cada pantalla, cualquier campo nuevo se añadía en una y
 * se olvidaba en la otra —que es justo como el período dejó de viajar.
 */
export function toReportQuery(scope: ReportScope): URLSearchParams {
  // `wallet` y NO `w`: ese nombre ya lo usa /wallets para abrir el detalle de
  // una billetera. Al compartirlo, salir de un reporte y volver a /wallets
  // reabría sola la billetera del filtro.
  const q = new URLSearchParams()
  if (scope.walletId) q.set('wallet', String(scope.walletId))
  if (scope.txType !== 'ALL') q.set('type', scope.txType.toLowerCase())
  if (scope.categoryIds.length > 0) q.set('cats', scope.categoryIds.join(','))
  if (scope.granularity !== 'MONTHLY') q.set('g', scope.granularity)
  if (scope.isCustom) {
    q.set('from', scope.range.from)
    q.set('to', scope.range.to)
  } else {
    q.set('d', monthStamp(scope.periodDate))
  }
  return q
}

/** Lo que `toReportQuery` escribió, de vuelta en estado inicial. */
export function fromReportQuery(params: URLSearchParams) {
  const from = params.get('from')
  const to = params.get('to')
  const d = params.get('d')
  return {
    walletId: Number(params.get('wallet')) || null,
    txType: (params.get('type')?.toUpperCase() as ReportTxType) || 'ALL',
    categoryIds: (params.get('cats') ?? '').split(',').map(Number).filter((n) => n > 0),
    granularity: (params.get('g') as Granularity) || 'MONTHLY',
    date: d ? new Date(`${d}T12:00:00`) : undefined,
    custom: from && to ? { from, to } : null,
  }
}
