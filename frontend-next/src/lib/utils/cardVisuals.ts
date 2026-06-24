// Gradiente oscuro tintado con el color de la cuenta (fallback cuando no hay skin).
export function cardGradient(color: string): string {
  return `linear-gradient(135deg, ${color} 0%, ${color}aa 32%, #15151c 100%)`
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
