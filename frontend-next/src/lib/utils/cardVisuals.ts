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

// SIN USO desde 2026-07-28: todas las superficies con aurora pasaron al tono
// atenuado de `categoryAura`. Se conserva como referencia del calibrado
// original ("V7 Contraluz") por si se quiere volver a un foco más intenso.
//
// Paleta de "aurora" animada MONOCROMÁTICA derivada del color del wallet (estilo skylrk):
// un único tono (el del wallet) que varía solo en luminosidad — base casi-negra → glow
// brillante. Sin tonos análogos: el wallet azul fluye solo en azules, etc.
export function walletAura(color: string): { base: string; blobs: [string, string, string, string] } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = Math.max(45, Math.min(Math.round(hsl.s), 82))
  // Variante "V7 Contraluz" (elegida por el usuario en demo 2026-07-14):
  // un solo foco brillante y el resto en penumbra — más negro que el mesh original.
  const base = `hsl(${h} ${Math.round(s * 0.6)}% 6%)`
  const blobs: [string, string, string, string] = [
    `hsl(${h} ${s}% 16%)`,                     // penumbra
    `hsl(${h} ${s}% 54%)`,                     // el único foco de luz
    `hsl(${h} ${Math.max(s - 18, 28)}% 60%)`, // halo del foco (desaturado)
    `hsl(${h} ${s}% 12%)`,                     // sombra profunda
  ]
  return { base, blobs }
}

/**
 * Aurora ATENUADA — variante suave de `walletAura`, adoptada como tono por
 * defecto de las superficies de color de la app: tarjetas de categoría, de
 * presupuesto y el carrusel de billeteras de /expenses.
 *
 * El foco original (saturación topeada en 82%, l:54%) sobre base casi negra
 * domina la tarjeta y, con varias juntas, hace vibrar la pantalla. Acá el tope
 * baja a 52% y el foco a l:40%, de modo que el color se lea como TINTE de la
 * superficie y no como un bloque. El blur mayor va en CSS (.aura-soft), para que
 * el degradado sea niebla y no un spot marcado.
 */
export function categoryAura(color: string): { base: string; blobs: [string, string, string, string] } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = Math.max(30, Math.min(Math.round(hsl.s), 52))
  const focus = 40
  return {
    base: `hsl(${h} ${Math.round(s * 0.6)}% 8%)`,
    blobs: [
      `hsl(${h} ${s}% ${Math.round(focus * 0.3)}%)`,        // penumbra
      `hsl(${h} ${s}% ${focus}%)`,                          // foco
      `hsl(${h} ${Math.max(s - 18, 20)}% ${focus + 6}%)`,   // halo
      `hsl(${h} ${s}% ${Math.round(focus * 0.22)}%)`,       // sombra
    ],
  }
}

/**
 * Muestra de color tal como se PERCIBE en la tarjeta.
 *
 * Los presets son hex saturados (#ef4444, #3b82f6…), pero las tarjetas los
 * pintan a través de `categoryAura`, que topea la saturación en 52% y baja la
 * luminosidad: elegir un rojo intenso devolvía una tarjeta apagada. Esta función
 * aplica la misma transformación para que el swatch anticipe el resultado.
 */
export function categorySwatch(color: string): string {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  const h = Math.round(hsl.h)
  const s = Math.max(30, Math.min(Math.round(hsl.s), 52))
  // Algo por encima del foco (40%) para que la ficha se lea como color pleno y
  // no como la penumbra de la tarjeta.
  return `hsl(${h} ${s}% 46%)`
}

// Hue + saturación de un color de categoría, para la aurora animada de los segmentos
// del gráfico de MOVIMIENTOS (mismo lenguaje visual monocromático que walletAura).
export function categoryHueSat(color: string): { h: number; s: number } {
  let hsl: { h: number; s: number; l: number }
  try {
    hsl = hexToHsl(color)
  } catch {
    hsl = { h: 45, s: 65, l: 50 }
  }
  return {
    h: Math.round(hsl.h),
    s: Math.max(45, Math.min(Math.round(hsl.s), 82)),
  }
}

// Crecimiento vs saldo inicial (mismo cálculo que WalletCarousel). null si initial === 0.
export function walletGrowth(
  balance: number,
  initialBalance: number,
): { pct: string; positive: boolean } | null {
  if (!initialBalance) return null
  const diff = balance - initialBalance
  return { pct: ((diff / Math.abs(initialBalance)) * 100).toFixed(1), positive: diff >= 0 }
}
