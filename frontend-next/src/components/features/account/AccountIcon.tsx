/**
 * Iconos de /account en estilo Solar (SVG oficiales embebidos inline, patrón CategoryIcon).
 * Usan currentColor → heredan el color del padre.
 */
export type AccountIconName =
  | 'moon' | 'sun' | 'tag' | 'chart-square' | 'calendar-mark' | 'exit' | 'chevron'

export function AccountIcon({ name, size = 16 }: { name: AccountIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }

  switch (name) {
    // solar:moon-linear
    case 'moon':
      return (
        <svg {...common}>
          <path fill="currentColor" d="m21.067 11.857l-.642-.388zm-8.924-8.924l-.388-.642zM21.25 12A9.25 9.25 0 0 1 12 21.25v1.5c5.937 0 10.75-4.813 10.75-10.75zM12 21.25A9.25 9.25 0 0 1 2.75 12h-1.5c0 5.937 4.813 10.75 10.75 10.75zM2.75 12A9.25 9.25 0 0 1 12 2.75v-1.5C6.063 1.25 1.25 6.063 1.25 12zm12.75 2.25A5.75 5.75 0 0 1 9.75 8.5h-1.5a7.25 7.25 0 0 0 7.25 7.25zm4.925-2.781A5.75 5.75 0 0 1 15.5 14.25v1.5a7.25 7.25 0 0 0 6.21-3.505zM9.75 8.5a5.75 5.75 0 0 1 2.781-4.925l-.776-1.284A7.25 7.25 0 0 0 8.25 8.5zM12 2.75a.38.38 0 0 1-.268-.118a.3.3 0 0 1-.082-.155c-.004-.031-.002-.121.105-.186l.776 1.284c.503-.304.665-.861.606-1.299c-.062-.455-.42-1.026-1.137-1.026zm9.71 9.495c-.066.107-.156.109-.187.105a.3.3 0 0 1-.155-.082a.38.38 0 0 1-.118-.268h1.5c0-.717-.571-1.075-1.026-1.137c-.438-.059-.995.103-1.299.606z" />
        </svg>
      )

    // solar:sun-2-linear
    case 'sun':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="5" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M4 12H2m20 0h-2m-.222-7.777l-2.222 2.031M4.222 4.223l2.222 2.031m0 11.302l-2.222 2.222m15.556-.001l-2.222-2.222" />
          </g>
        </svg>
      )

    // solar:tag-linear
    case 'tag':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.728 16.137c-1.545-1.546-2.318-2.318-2.605-3.321c-.288-1.003-.042-2.068.45-4.197l.283-1.228c.413-1.792.62-2.688 1.233-3.302s1.51-.82 3.302-1.233l1.228-.284c2.13-.491 3.194-.737 4.197-.45c1.003.288 1.775 1.061 3.32 2.606l1.83 1.83C20.657 9.248 22 10.592 22 12.262c0 1.671-1.344 3.015-4.033 5.704c-2.69 2.69-4.034 4.034-5.705 4.034c-1.67 0-3.015-1.344-5.704-4.033z" />
            <circle cx="8.607" cy="8.879" r="2" transform="rotate(-45 8.607 8.879)" />
            <path strokeLinecap="round" d="m11.542 18.5l6.979-6.98" />
          </g>
        </svg>
      )

    // solar:chart-square-linear
    case 'chart-square':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z" />
            <path strokeLinecap="round" d="M7 18V9m5 9V6m5 12v-5" />
          </g>
        </svg>
      )

    // solar:calendar-mark-linear
    case 'calendar-mark':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z" />
            <path strokeLinecap="round" d="M7 4V2.5M17 4V2.5" />
            <circle cx="16.5" cy="16.5" r="1.5" />
            <path strokeLinecap="round" d="M2.5 9h19" />
          </g>
        </svg>
      )

    // solar:exit-linear
    case 'exit':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 4.5H8c-2.357 0-3.536 0-4.268.732S3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268S5.643 19.5 8 19.5h1M9 6.476c0-2.293 0-3.44.707-4.067s1.788-.439 3.95-.062l2.33.407c2.394.417 3.591.626 4.302 1.504c.711.879.711 2.149.711 4.69v6.105c0 2.54 0 3.81-.71 4.689c-.712.878-1.91 1.087-4.304 1.505l-2.328.406c-2.162.377-3.243.565-3.95-.062S9 19.817 9 17.524z" />
            <path strokeLinecap="round" d="M12 11v2" />
          </g>
        </svg>
      )

    // solar:alt-arrow-right-linear (trailing chevron)
    case 'chevron':
      return (
        <svg {...common}>
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m9 5l6 7l-6 7" />
        </svg>
      )
  }
}
