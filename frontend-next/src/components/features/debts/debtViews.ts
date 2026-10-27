import type { Debt, DebtDirection, DebtKind } from '@/types'

/**
 * Las tres pestañas de /debts:
 * - Me deben: lo que se registra al repartir un gasto (y lo que prestaste).
 * - Debo: alguien pagó por ti; no entró dinero, solo hay que devolverlo.
 * - Préstamos: te prestaron dinero; entró a tu cuenta y hay que devolverlo.
 */
export type DebtTab = 'theyOwe' | 'iOwe' | 'loans'

/** Lo que registra el + de una pestaña: el tipo lo decide la pestaña. */
export interface DebtCreateConfig {
  kind: DebtKind
  title: string
  /** Si movió dinero de una billetera al registrarse. */
  needsWallet: boolean
}

export interface DebtView {
  tab: DebtTab
  label: string
  /** La API devuelve las deudas por dirección; la pestaña filtra encima. */
  direction: DebtDirection
  includes: (debt: Debt) => boolean
  totalLabel: string
  /** Sustantivo del contador de cada persona ("2 deudas", "1 préstamo"). */
  noun: [singular: string, plural: string]
  empty: string
  create: DebtCreateConfig
  created: (amount: string, person: string) => { title: string; description: string }
}

export const DEBT_VIEWS: DebtView[] = [
  {
    tab: 'theyOwe', label: 'Me deben', direction: 'THEY_OWE',
    includes: () => true,
    totalLabel: 'Te deben', noun: ['deuda', 'deudas'],
    empty: 'Nadie te debe.',
    // Pagaste tú: el dinero salió de tu billetera y vuelve cuando te paguen.
    create: { kind: 'PAID_FOR_THEM', title: 'Nueva deuda', needsWallet: true },
    created: (amount, person) => ({ title: 'Registrado', description: `${person} te debe ${amount}. El dinero salió de tu billetera.` }),
  },
  {
    tab: 'iOwe', label: 'Debo', direction: 'I_OWE',
    includes: (d) => d.kind === 'PAID_FOR_ME',
    totalLabel: 'Debes', noun: ['deuda', 'deudas'],
    empty: 'No debes nada.',
    create: { kind: 'PAID_FOR_ME', title: 'Nueva deuda', needsWallet: false },
    created: (amount, person) => ({ title: 'Registrado', description: `Le debes ${amount} a ${person}. Tu saldo no cambia hasta que le pagues.` }),
  },
  {
    tab: 'loans', label: 'Préstamos', direction: 'I_OWE',
    // Todo lo que debes y no es "pagó por mí" es un préstamo recibido.
    includes: (d) => d.kind !== 'PAID_FOR_ME',
    totalLabel: 'Por devolver', noun: ['préstamo', 'préstamos'],
    empty: 'No tienes préstamos por devolver.',
    create: { kind: 'LOAN', title: 'Nuevo préstamo', needsWallet: true },
    created: (amount, person) => ({ title: 'Préstamo registrado', description: `Le debes ${amount} a ${person}. El dinero entró a tu billetera.` }),
  },
]

export const viewOf = (tab: DebtTab): DebtView => DEBT_VIEWS.find((v) => v.tab === tab) ?? DEBT_VIEWS[0]

/** Rótulo de una deuda sin descripción, según de dónde viene. */
export const debtLabel = (debt: Debt): string =>
  debt.description
  || (debt.expenseId != null ? 'Gasto compartido' : debt.kind === 'LOAN' ? 'Préstamo' : 'Deuda')
