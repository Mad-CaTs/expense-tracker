/** Resultado de guardar un movimiento, para el aviso de éxito. */
export interface TxSummary {
  kind: 'expense' | 'income' | 'transfer'
  /** true si se editó uno existente en vez de crear uno nuevo. */
  edited: boolean
  amount: number
  /** Descripción del gasto/ingreso, o "Ahorros → Efectivo" en una transferencia. */
  label: string
  /** true si el movimiento se eliminó; el monto no aplica en ese caso. */
  deleted?: boolean
}

export function txDialogTitle(s: TxSummary): string {
  if (s.kind === 'transfer') return 'Transferencia realizada'
  const noun = s.kind === 'expense' ? 'Gasto' : 'Ingreso'
  if (s.deleted) return `${noun} eliminado`
  return s.edited ? `${noun} actualizado` : `${noun} registrado`
}

export function txDialogDescription(s: TxSummary): string {
  if (s.deleted) return 'El movimiento ya no aparece en tus registros.'
  const amount = `S/ ${s.amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (s.kind === 'transfer') return `${amount} · ${s.label}.`
  return s.label ? `"${s.label}" por ${amount}.` : `${amount}.`
}
