import type { PiggyBank } from '@/types'

/** Todo lo apartado en las alcancías de una billetera. */
export const savedTotal = (piggies: PiggyBank[]) => piggies.reduce((acc, p) => acc + Number(p.balance), 0)
