'use client'

import { LeatherWallet } from '@/components/features/wallets/LeatherWallet'
import type { Wallet } from '@/types'

/** Billetera de ejemplo del slide: solo se pinta, no existe en la base. */
const SAMPLE_WALLET: Wallet = {
  id: 0,
  name: 'Ahorros',
  initialBalance: 0,
  balance: 2150.4,
  color: '#22c55e',
  backgroundId: null,
}

/** Movimientos de muestra: dan a entender el formato de la lista real. */
const SAMPLE_ROWS: { name: string; category: string; amount: string; color: string; income?: boolean }[] = [
  { name: 'Mercado', category: 'Comida', amount: '−S/ 120.00', color: '#a855f7' },
  { name: 'Taxi', category: 'Transporte', amount: '−S/ 18.00', color: '#3b82f6' },
  { name: 'Sueldo', category: 'Salario', amount: '+S/ 2,450.00', color: '#22c55e', income: true },
]

function SampleList() {
  return (
    <div className="flex w-[280px] flex-col gap-2">
      {SAMPLE_ROWS.map((row) => (
        <div
          key={row.name}
          className="liquid-glass flex items-center gap-2.5 rounded-[15px] px-3.5 py-3"
        >
          <span className="h-[30px] w-[30px] flex-none rounded-[10px]" style={{ background: `${row.color}33` }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {row.name}
            </span>
            <span className="mt-px block text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
              {row.category}
            </span>
          </span>
          <span
            className="mono-amount text-[12.5px] font-extrabold tabular-nums"
            style={{ color: row.income ? 'var(--success)' : 'var(--text-primary)' }}
          >
            {row.amount}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Coordenada estable entre servidor y cliente (ver el uso en SampleDonut). */
function round(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Donut de muestra del slide de reportes.
 *
 * Dibujado acá y no con `SpokeDonut`: ese componente pide un breakdown real y
 * trae selección, atenuado y conteo. Lo que hace falta es la FORMA, para que al
 * llegar a Estadísticas se reconozca.
 */
function SampleDonut() {
  const SIZE = 170, C = SIZE / 2, R_IN = 48, R_OUT = 71, N = 54
  const segments: [number, number][] = [[18, 300], [12, 168], [10, 265], [8, 150], [6, 38]]

  const lines: React.ReactElement[] = []
  let i = 0
  segments.forEach(([count, hue]) => {
    for (let k = 0; k < count; k++, i++) {
      const t = count > 1 ? k / (count - 1) : 0
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2
      const cos = Math.cos(angle), sin = Math.sin(angle)
      lines.push(
        <line
          key={i}
          x1={round(C + cos * R_IN)} y1={round(C + sin * R_IN)}
          x2={round(C + cos * R_OUT)} y2={round(C + sin * R_OUT)}
          stroke={`hsl(${hue} 42% ${54 - t * 14}%)`}
          strokeWidth={3.6}
          strokeLinecap="round"
        />
      )
    }
  })

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      {lines}
      <text x={C} y={C - 4} textAnchor="middle" className="text-[8px] font-bold uppercase tracking-[0.1em]" fill="var(--text-tertiary)">
        Gastos
      </text>
      <text x={C} y={C + 16} textAnchor="middle" className="mono-amount text-[19px] font-extrabold tabular-nums" fill="var(--text-primary)">
        S/ 1,733
      </text>
    </svg>
  )
}

export interface IntroSlide {
  art: React.ReactNode
  title: string
  text: string
}

export const INTRO_SLIDES: IntroSlide[] = [
  {
    art: (
      <span className="liquid-glass grid h-[108px] w-[108px] place-items-center rounded-[34px]">
        {/* El logo mide 162x90: forzarlo a un cuadrado lo aplastaba. Se fija el
            ancho y `contain` resuelve el alto respetando su proporción, igual
            que en WalletChip y el carrusel. Se pinta con el color del texto
            —vía `mask`— para que contraste en los dos temas sin invertirlo. */}
        <span
          aria-hidden
          className="block h-[38px] w-[68px]"
          style={{
            background: 'var(--text-primary)',
            WebkitMaskImage: 'url(/brand/logo.webp)',
            maskImage: 'url(/brand/logo.webp)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </span>
    ),
    title: 'Bienvenido a Pockr',
    text: 'Tus gastos e ingresos, claros y en un solo lugar.',
  },
  {
    art: <LeatherWallet wallet={SAMPLE_WALLET} width={214} />,
    title: 'Todo vive en una billetera',
    text: 'Cada billetera guarda su propio saldo y sus movimientos. Puedes tener las que necesites: efectivo, banco, ahorros.',
  },
  {
    art: <SampleList />,
    title: 'Registra en dos toques',
    text: 'Gastos, ingresos y transferencias entre tus billeteras. Tus categorías ya vienen listas para usar.',
  },
  {
    art: <SampleDonut />,
    title: 'Mira a dónde se va',
    text: 'Reportes por período y estadísticas por categoría, para cada billetera.',
  },
]
