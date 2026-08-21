/** Lo mínimo para ordenar un movimiento: su fecha, su id y —si el backend lo
 *  expone— el instante de alta. */
export interface Datable {
  date: string
  /** Autoincremental del recurso. Solo comparable entre movimientos del MISMO
   *  recurso: gastos e ingresos son tablas con secuencias independientes. */
  id: number
  /** Instante de alta (ISO). Opcional: puede faltar en registros dados de alta
   *  antes de que el backend lo expusiera. */
  createdAt?: string | null
}

/**
 * Orden canónico de cualquier lista de movimientos: **del más reciente al más
 * antiguo**.
 *
 * La clave primaria es `date` —la fecha que el usuario asigna al movimiento, que
 * puede ser pasada—, así que un gasto registrado hoy con fecha de la semana
 * pasada aparece en su día, no arriba del todo. `createdAt` solo desempata
 * **dentro del mismo día**.
 *
 * Por qué `createdAt` y no el id: en un feed mezclado (gastos + ingresos) los
 * ids provienen de tablas distintas con secuencias independientes, así que no
 * son comparables entre sí. Un ingreso con id 21 registrado después de un gasto
 * con id 135 caía al fondo de su día aunque fuera el más reciente.
 *
 * Degradación: el id sigue siendo el desempate cuando a alguno de los dos le
 * falta `createdAt`. Se exige que AMBOS lo tengan porque mezclar los dos
 * criterios en una misma ordenación produce un comparador no transitivo (A>B
 * por timestamp, B>C por id, C>A por timestamp), lo que dejaría la lista en un
 * orden arbitrario. Con el id como fallback uniforme el resultado es, en el peor
 * caso, el comportamiento anterior: correcto dentro de cada recurso.
 */
export function byRecent(a: Datable, b: Datable): number {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate

  if (a.createdAt && b.createdAt) {
    const byCreatedAt = b.createdAt.localeCompare(a.createdAt)
    if (byCreatedAt !== 0) return byCreatedAt
  }

  return b.id - a.id
}
