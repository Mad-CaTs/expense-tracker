/**
 * Iconos de los botones de acción del Home (Gasto/Ingreso/Transferir/Escanear).
 * SVGs oficiales del set Solar (Linear) embebidos inline — mismo enfoque que CategoryIcon,
 * sin dependencia de librería externa. Usan currentColor, así que heredan el color del padre.
 */
export type ActionIconName = 'gasto' | 'ingreso' | 'transferir' | 'escanear'

export function ActionIcon({ name, size = 24 }: { name: ActionIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }

  switch (name) {
    // Gasto — solar:plain-3-linear (avión de papel)
    case 'gasto':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m18.636 15.67l1.716-5.15c1.5-4.498 2.25-6.747 1.062-7.934s-3.436-.438-7.935 1.062L8.33 5.364C4.7 6.574 2.885 7.18 2.37 8.067a2.72 2.72 0 0 0 0 2.73c.515.888 2.33 1.493 5.96 2.704c.584.194.875.291 1.119.454c.236.158.439.361.597.597c.163.244.26.535.454 1.118c1.21 3.63 1.816 5.446 2.703 5.962a2.72 2.72 0 0 0 2.731 0c.887-.516 1.492-2.331 2.703-5.962Z" />
            <path strokeLinecap="round" d="m17.79 6.21l-4.21 4.165" />
          </g>
        </svg>
      )

    // Ingreso — solar:inbox-in-linear (bandeja con flecha hacia abajo)
    case 'ingreso':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
            <path strokeLinejoin="round" d="M12 2v8m0 0l3-3m-3 3L9 7" />
            <path d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22" />
            <path d="M17 2.127c1.625.16 2.72.521 3.535 1.338C22 4.929 22 7.286 22 12s0 7.071-1.465 8.536C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.464C2 19.07 2 16.714 2 12s0-7.07 1.464-8.535C4.281 2.648 5.374 2.287 7 2.127" />
          </g>
        </svg>
      )

    // Transferir — solar:transfer-horizontal-linear (doble flecha)
    case 'transferir':
      return (
        <svg {...common}>
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 10H4l5.5-6M4 14h16l-5.5 6" />
        </svg>
      )

    // Escanear — solar:scanner-linear (marco redondeado + línea)
    case 'escanear':
      return (
        <svg {...common}>
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M10 22c-3.771 0-5.657 0-6.828-1.172S2 18.771 2 15m20 0c0 3.771 0 4.657-1.172 5.828S17.771 22 14 22m0-20c3.771 0 5.657 0 6.828 1.172S22 5.229 22 9M10 2C6.229 2 4.343 2 3.172 3.172S2 5.229 2 9m0 3h20" />
        </svg>
      )
  }
}
