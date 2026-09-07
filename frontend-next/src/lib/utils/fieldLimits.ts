/**
 * Límites de longitud de los campos de texto libre.
 *
 * Son límites de PRODUCTO, no de esquema: las columnas aguantan mucho más
 * (varchar 500/1000/255), pero una descripción es un rótulo para reconocer el
 * movimiento en una lista, no un párrafo. Se eligieron por lo que cabe y se lee
 * en la fila, no por lo que tolera la base.
 *
 * Tienen que ser MENORES O IGUALES que las columnas y que los `@Size` del
 * backend; si fueran mayores, el servidor rechazaría recién al guardar.
 */
export const FIELD_LIMITS = {
  /** Descripción de gasto, ingreso, transferencia y recurrente. */
  description: 100,
  /** Nota de gasto e ingreso. */
  notes: 200,
  /** Nombre de un deudor. Texto libre: no hay entidad Persona. */
  personName: 100,
} as const

/**
 * A partir de qué punto se le muestra el contador al usuario.
 *
 * Un contador visible desde el carácter 1 es ruido: estos límites son altos y
 * casi nadie los roza. Aparece solo cuando queda poco margen, que es cuando
 * de verdad informa.
 */
const WARN_RATIO = 0.8

export const shouldWarn = (length: number, limit: number) => length >= limit * WARN_RATIO
