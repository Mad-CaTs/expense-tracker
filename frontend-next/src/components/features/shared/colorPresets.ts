/**
 * Paleta única de la app: la eligen categorías, presupuestos y billeteras.
 *
 * Son hex saturados a propósito — es el valor que se guarda—, pero NINGUNA
 * superficie los pinta tal cual: `categoryAura` topea la saturación en 52% y
 * baja la luminosidad para que varias tarjetas juntas no vibren. Por eso las
 * fichas de selección deben mostrarse con `categorySwatch`, que devuelve el
 * tono tal como se percibe; con el hex crudo, el color elegido nunca coincidía
 * con el resultado.
 */
export const COLOR_PRESETS = [
  '#d4af37', '#ef4444', '#3b82f6', '#22c55e',
  '#f97316', '#a855f7', '#ec4899', '#14b8a6',
  '#f59e0b', '#6366f1',
]
