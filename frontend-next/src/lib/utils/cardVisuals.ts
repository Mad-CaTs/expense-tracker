// Gradiente oscuro tintado con el color de la cuenta (fallback cuando no hay skin).
export function cardGradient(color: string): string {
  return `linear-gradient(135deg, ${color} 0%, ${color}aa 32%, #15151c 100%)`
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '').trim()
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

/** Por debajo de esta saturación el color no tiene matiz que respetar. */
const ACHROMATIC_S = 8

/**
 * Saturación de la aurora, con suelo para que un color apagado siga tiñendo.
 *
 * El suelo NO se aplica a los acromáticos: en blanco, negro y grises `hexToHsl`
 * devuelve matiz 0, así que forzar saturación los convertía en rojo —una
 * billetera blanca salía granate. Sin saturación quedan en gris, que es su
 * color real.
 */
function auraSaturation(raw: number, floor: number, ceil: number): number {
  if (raw < ACHROMATIC_S) return 0
  return Math.max(floor, Math.min(raw, ceil))
}

/**
 * Saturación del halo, siempre por debajo de la del foco.
 *
 * Su suelo propio también se salta en los acromáticos: con `s` ya en 0 este
 * `Math.max` lo devolvía a 20 y el halo salía rojizo aunque el resto de la
 * aurora fuese gris.
 */
function haloSaturation(s: number, floor: number): number {
  if (s === 0) return 0
  return Math.max(s - 18, floor)
}

export function walletAura(color: string): { base: string; blobs: [string, string, string, string] } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = auraSaturation(Math.round(hsl.s), 45, 82)
  const base = `hsl(${h} ${Math.round(s * 0.6)}% 6%)`
  const blobs: [string, string, string, string] = [
    `hsl(${h} ${s}% 16%)`,                     // penumbra
    `hsl(${h} ${s}% 54%)`,                     // el único foco de luz
    `hsl(${h} ${haloSaturation(s, 28)}% 60%)`, // halo del foco (desaturado)
    `hsl(${h} ${s}% 12%)`,                     // sombra profunda
  ]
  return { base, blobs }
}


export function categoryAura(color: string): { base: string; blobs: [string, string, string, string] } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = auraSaturation(Math.round(hsl.s), 30, 52)
  const focus = 40
  return {
    base: `hsl(${h} ${Math.round(s * 0.6)}% 8%)`,
    blobs: [
      `hsl(${h} ${s}% ${Math.round(focus * 0.3)}%)`,        // penumbra
      `hsl(${h} ${s}% ${focus}%)`,                          // foco
      `hsl(${h} ${haloSaturation(s, 20)}% ${focus + 6}%)`,  // halo
      `hsl(${h} ${s}% ${Math.round(focus * 0.22)}%)`,       // sombra
    ],
  }
}


export function categorySwatch(color: string): string {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = auraSaturation(Math.round(hsl.s), 30, 52)
  return `hsl(${h} ${s}% 46%)`
}


export function categoryHueSat(color: string): { h: number; s: number } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  return {
    h: Math.round(hsl.h),
    s: auraSaturation(Math.round(hsl.s), 45, 82),
  }
}

export function walletGrowth(
  balance: number,
  initialBalance: number,
): { pct: string; positive: boolean } | null {
  if (!initialBalance) return null
  const diff = balance - initialBalance
  return { pct: ((diff / Math.abs(initialBalance)) * 100).toFixed(1), positive: diff >= 0 }
}
