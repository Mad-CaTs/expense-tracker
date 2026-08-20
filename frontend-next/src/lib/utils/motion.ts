/**
 * Escala de movimiento de la app.
 *
 * Una sola curva para todo: la del paginado de iOS. Arranca con algo de
 * aceleración y frena largo, así el recorrido se LEE en vez de saltar. La
 * anterior (0.23, 1, 0.32, 1 — ease-out-quint) gastaba ~80% del recorrido en el
 * primer tercio del tiempo y en móvil las transiciones terminaban antes de que
 * el dedo se levantara.
 *
 * Lo que cambia por interacción NO es la curva sino la duración: un tap debe
 * responder al dedo, un deslizamiento debe poder seguirse con la vista. Usar la
 * misma duración para ambos es lo que vuelve una UI pastosa.
 */
export const EASE = [0.32, 0.72, 0, 1] as const

/** Para CSS (`transition`/`animation`), la misma curva. */
export const EASE_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)'

/** Duraciones en milisegundos. */
export const MOTION = {
  /** Feedback inmediato al dedo: hundido de un botón. */
  press: 120,
  /** Cambios de color/opacidad en el sitio: hover, estado activo. */
  tint: 180,
  /** Aparición o cierre de una capa: modales, expansiones, backdrops. */
  layer: 300,
  /** Bottom sheet que recorre el alto de la pantalla: a `layer` el panel salta
   *  en vez de deslizarse — el recorrido es mucho mayor que el de una capa que
   *  solo aparece en el sitio. */
  sheet: 420,
  /** Cambio de paso dentro de un sheet. Más lento que `layer` porque el panel
   *  queda quieto y solo viaja el contenido: sin el arrastre del contenedor,
   *  una duración corta se lee como un corte. */
  step: 460,
  /** Recorrido que hay que poder seguir con la vista: carruseles, paginado. */
  travel: 460,
  /** Vuelta a una pantalla completa que se reconstruye (detalle de wallet desde
   *  un listado): más lenta que `travel` porque entra la vista entera, no un
   *  elemento — a 300ms en móvil no se distinguía de un corte. */
  restore: 620,
  /** Cifra que recorre hasta su valor (ver AnimatedAmount). Acompasada con
   *  `enter-pop` (0.84s): con una duración menor el número terminaba de contar
   *  mientras la tarjeta todavía estaba entrando. */
  count: 840,
} as const

/** Las mismas duraciones en segundos, para framer-motion. */
export const MOTION_S = {
  press: MOTION.press / 1000,
  tint: MOTION.tint / 1000,
  layer: MOTION.layer / 1000,
  sheet: MOTION.sheet / 1000,
  step: MOTION.step / 1000,
  travel: MOTION.travel / 1000,
  restore: MOTION.restore / 1000,
  count: MOTION.count / 1000,
} as const
