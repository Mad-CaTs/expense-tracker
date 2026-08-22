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
/** Logotipo de Visa, trazado oficial (dominio público por no alcanzar el umbral
 *  de originalidad; la MARCA sigue registrada). En blanco: sobre el metal teñido
 *  el azul corporativo no contrasta. */
const VISA_SVG =
  '<svg class="wd-cf-visa" viewBox="0 0 1000 324.68" fill="#fff" aria-hidden="true">' +
  '<path d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"/>' +
  '</svg>'

/** Marca de Pockr, el mismo trazado que el icono de la app. */
const POCKR_SVG =
  '<svg class="wd-cf-brand" viewBox="0 0 162 162" aria-hidden="true">' +
  '<g transform="translate(0,126) scale(0.1,-0.1)" fill="currentColor">' +
  '<path d="M1223 798 c-21 -18 -43 -37 -49 -43 -93 -86 -189 -172 -200 -178 -12 -7 -54 58 -86 135 -24 58 -51 46 -192 -87 -141 -133 -127 -128 -161 -60 -43 90 -52 88 -183 -32 -49 -45 -109 -100 -134 -123 -61 -54 -46 -264 23 -334 20 -21 137 67 306 231 57 55 57 -15 0 -75 l-31 -32 33 -65 c45 -87 64 -87 165 5 52 47 49 44 151 135 50 44 101 93 115 108 22 26 25 27 31 10 9 -25 -7 -62 -41 -98 l-29 -30 46 -94 c67 -134 73 -134 234 10 63 56 147 131 187 167 123 110 123 111 13 303 -117 202 -126 209 -198 147z"/>' +
  '</g></svg>'

/**
 * Halo de color en la esquina inferior derecha + trama de puntos sobre toda la
 * cara. Los dos fondos van apilados en una capa: la opacidad se mete DENTRO del
 * color del halo, porque `opacity` atenuaría también la trama.
 */
function patternCSS(tint: string): string {
  return (
    'background:radial-gradient(rgba(255,255,255,.13) 1px, transparent 1.2px),' +
    `radial-gradient(76% 88% at 96% 96%, ${tint} 0%, transparent 58%);` +
    'background-size:11px 11px, auto;opacity:.62;mix-blend-mode:screen'
  )
}

/** El cuerpo de la cara es el 6.2% del ancho: todo lo demás va en `em`, así que
 *  con este único número la tarjeta escala entera. Se exporta porque el vuelo lo
 *  anima mientras la tarjeta crece. */
export const CARD_FS_RATIO = 0.062

export function cardFaceHTML(tint: string, balance: number, widthPx: number): string {
  const fontSize = (widthPx * CARD_FS_RATIO).toFixed(2)
  const base = metallicTintColor(tint)
  return (
    `<div class="wd-card-front" style="font-size:${fontSize}px;background:${base}">` +
    `<span class="wd-cf-pattern" style="${patternCSS(tint)}" aria-hidden="true"></span>` +
    '<span class="wd-cf-glow" aria-hidden="true"></span>' +
    '<span class="wd-cf-chip" aria-hidden="true"></span>' +
    '<svg class="wd-cf-wave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M8.5 8a5 5 0 0 1 0 8M12 5.5a8.5 8.5 0 0 1 0 13M5 10.5a2 2 0 0 1 0 3"/></svg>' +
    '<span class="wd-cf-content">' +
    '<span class="wd-cf-label">Saldo disponible</span>' +
    `<span class="wd-cf-amount"><small>S/</small>${formatBalance(balance)}</span>` +
    '</span>' +
    `<span class="wd-cf-foot" aria-hidden="true">${POCKR_SVG}${VISA_SVG}</span>` +
    '</div>'
  )
}
