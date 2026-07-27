export function formatBalance(n: number): string {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Luminancia del cuerpo del metal de card.webp (tono dominante, no los brillos):
 *  con blend 'color' + tint da el mismo acabado que la tarjeta del carrusel. */
const CARD_METAL_LUMA = 133 / 255
/** Opacidad de la capa de tinte, igual que en el carrusel (mix-blend-mode: color). */
const TINT_OPACITY = 0.55

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}
const luma = (r: number, g: number, b: number) => (0.3 * r + 0.59 * g + 0.11 * b) / 255

/** Lleva el color a la luminancia objetivo conservando su matiz (clip a gamut). */
function setLuma(rgb: [number, number, number], target: number): [number, number, number] {
  let [r, g, b] = rgb.map((v) => v / 255) as [number, number, number]
  const d = target - luma(r * 255, g * 255, b * 255)
  r += d; g += d; b += d
  const lo = Math.min(r, g, b)
  const hi = Math.max(r, g, b)
  if (lo < 0) { const s = target / (target - lo); r = target + (r - target) * s; g = target + (g - target) * s; b = target + (b - target) * s }
  if (hi > 1) { const s = (1 - target) / (hi - target); r = target + (r - target) * s; g = target + (g - target) * s; b = target + (b - target) * s }
  return [r * 255, g * 255, b * 255]
}

/**
 * Color plano de la tarjeta: reproduce `mix-blend-mode: color` (0.55) del tinte del
 * wallet sobre el metal de card.webp — el mismo acabado que en el carrusel.
 */
function metallicTintColor(tint: string): string {
  const blended = setLuma(hexToRgb(tint), CARD_METAL_LUMA)
  const grey = CARD_METAL_LUMA * 255
  const mix = (c: number) => grey * (1 - TINT_OPACITY) + c * TINT_OPACITY
  return rgbToHex(mix(blended[0]), mix(blended[1]), mix(blended[2]))
}

/**
 * Cara frontal de la tarjeta (propuesta B + iluminación de C): color metálico PLANO
 * del wallet, chip dorado y ondas contactless arriba a la derecha, con un brillo
 * radial suave desde la esquina superior derecha. Sin gradientes de desvanecido.
 * HTML compartido entre la capa fx del vuelo y la tarjeta adoptada: un único origen
 * garantiza que el swap al aterrizar sea invisible.
 */
export function cardFaceHTML(tint: string, balance: number, widthPx: number): string {
  const fontSize = (widthPx * 0.062).toFixed(2)
  const base = metallicTintColor(tint)
  return (
    `<div class="wd-card-front" style="font-size:${fontSize}px;background:${base}">` +
    '<span class="wd-cf-glow" aria-hidden="true"></span>' +
    '<span class="wd-cf-chip" aria-hidden="true"></span>' +
    '<svg class="wd-cf-wave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M8.5 8a5 5 0 0 1 0 8M12 5.5a8.5 8.5 0 0 1 0 13M5 10.5a2 2 0 0 1 0 3"/></svg>' +
    '<span class="wd-cf-content">' +
    '<span class="wd-cf-label">Saldo disponible</span>' +
    `<span class="wd-cf-amount"><small>S/</small>${formatBalance(balance)}</span>` +
    '</span>' +
    '</div>'
  )
}
