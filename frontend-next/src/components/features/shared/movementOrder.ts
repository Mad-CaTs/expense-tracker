/** Lo mínimo para ordenar un movimiento: su fecha y su id. */
export interface Datable {
  date: string
  /** Autoincremental del recurso: a mayor id, más reciente. */
  id: number
}

/**
 * Orden canónico de cualquier lista de movimientos: **del más reciente al más
 * antiguo**.
 *
 * El desempate por id descendente es lo que hace que, dentro de un mismo día,
 * lo último registrado quede arriba. Sin él —o comparando la clave como texto,
 * que es lo que se hacía antes— un gasto recién creado caía al final de su día
 * y parecía que no se había guardado.
 */
export function byRecent(a: Datable, b: Datable): number {
  return b.date.localeCompare(a.date) || b.id - a.id
}
