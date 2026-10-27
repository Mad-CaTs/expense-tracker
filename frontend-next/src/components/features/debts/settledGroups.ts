import type { Debt, DebtPersonGroup } from '@/types'

export interface SettledPerson {
  personName: string
  debts: Debt[]
}

export interface SettledMonth {
  /** `YYYY-MM` del mes en que se saldaron. */
  key: string
  people: SettledPerson[]
  /** Todas las del mes, sin agrupar: de acá salen el conteo y el subtotal. */
  debts: Debt[]
}

const MONTH_KEY_LENGTH = 'YYYY-MM'.length

/** Día en que se saldó. Si el dato falta, cae en la fecha de la deuda. */
export const settledDay = (debt: Debt) => debt.settledOn ?? debt.incurredOn

/**
 * Lo saldado, por mes y dentro de cada mes por persona.
 *
 * Todo va de lo más reciente a lo más antiguo: los meses, las personas dentro
 * del mes —por su última devolución— y las deudas de cada persona. Sale gratis
 * de ordenar una sola vez y agrupar con `Map`, que respeta el orden de llegada.
 */
export function groupSettledByMonth(groups: DebtPersonGroup[]): SettledMonth[] {
  const settled = groups
    .flatMap((g) => g.debts.filter((d) => d.status === 'SETTLED').map((debt) => ({ debt, personName: g.personName })))
    .sort((a, b) => settledDay(b.debt).localeCompare(settledDay(a.debt)))

  const months = new Map<string, Map<string, Debt[]>>()
  for (const { debt, personName } of settled) {
    const key = settledDay(debt).slice(0, MONTH_KEY_LENGTH)
    const people = months.get(key) ?? new Map<string, Debt[]>()
    people.set(personName, [...(people.get(personName) ?? []), debt])
    months.set(key, people)
  }

  return [...months].map(([key, people]) => ({
    key,
    people: [...people].map(([personName, debts]) => ({ personName, debts })),
    debts: [...people.values()].flat(),
  }))
}
