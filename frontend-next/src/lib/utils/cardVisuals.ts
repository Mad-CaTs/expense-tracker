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
  const base = `hsl(${h} ${Math.round(s * 0.7)}% 9%)`
  const blobs: [string, string, string, string] = [
    `hsl(${h} ${s}% 38%)`,
    `hsl(${h} ${s}% 54%)`,
    `hsl(${h} ${Math.max(s - 18, 28)}% 70%)`, // glow brillante (algo desaturado → tiende a blanco)
    `hsl(${h} ${s}% 30%)`,                     // tono medio-oscuro para profundidad
  ]
  return { base, blobs }
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
