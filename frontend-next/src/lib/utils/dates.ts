/** Hoy como `YYYY-MM-DD`, en la zona del dispositivo —no en UTC: de noche en
 *  Perú, `toISOString()` ya devuelve el día siguiente. */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
