/** Iconos Solar (inline SVG, currentColor) para las cards de acceso de la vista
 *  de detalle: Categorías, Frecuentes, Presupuesto. Misma familia Solar que el
 *  resto de la app (ver AccountIcon). */
export type WalletAccessIconName = 'categorias' | 'frecuentes' | 'presupuesto'

export function WalletAccessIcon({ name, size = 20 }: { name: WalletAccessIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }
  switch (name) {
    // solar:tag-linear
    case 'categorias':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.728 16.137c-1.545-1.546-2.318-2.318-2.605-3.321c-.288-1.003-.042-2.068.45-4.197l.283-1.228c.413-1.792.62-2.688 1.233-3.302s1.51-.82 3.302-1.233l1.228-.284c2.13-.491 3.194-.737 4.197-.45c1.003.288 1.775 1.061 3.32 2.606l1.83 1.83C20.657 9.248 22 10.592 22 12.262c0 1.671-1.344 3.015-4.033 5.704c-2.69 2.69-4.034 4.034-5.705 4.034c-1.67 0-3.015-1.344-5.704-4.033z" />
            <circle cx="8.607" cy="8.879" r="2" transform="rotate(-45 8.607 8.879)" />
            <path strokeLinecap="round" d="m11.542 18.5l6.979-6.98" />
          </g>
        </svg>
      )
    // solar:calendar-mark-linear
    case 'frecuentes':
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
    // solar:wallet-money-linear
    case 'presupuesto':
      return (
        <svg {...common}>
          <g fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h4" />
            <path strokeWidth="1.5" d="M20.833 11h-2.602C16.446 11 15 12.343 15 14s1.447 3 3.23 3h2.603c.084 0 .125 0 .16-.002c.54-.033.97-.432 1.005-.933c.002-.032.002-.071.002-.148v-3.834c0-.077 0-.116-.002-.148c-.036-.501-.465-.9-1.005-.933c-.035-.002-.076-.002-.16-.002Z" />
            <path strokeWidth="1.5" d="M20.965 11c-.078-1.872-.328-3.02-1.137-3.828C18.657 6 16.771 6 13 6h-3C6.229 6 4.343 6 3.172 7.172S2 10.229 2 14s0 5.657 1.172 6.828S6.229 22 10 22h3c3.771 0 5.657 0 6.828-1.172c.809-.808 1.06-1.956 1.137-3.828" />
            <path strokeLinecap="round" strokeWidth="1.5" d="m6 6l3.735-2.477a3.24 3.24 0 0 1 3.53 0L17 6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.991 14h.01" />
          </g>
        </svg>
      )
  }
}
