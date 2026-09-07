/** Iconos del menú de la tarjeta (familia Solar, SVG inline como el resto de
 *  la app). Viven acá y no en `ui/`: son chrome de este menú, no primitivas. */

function Pencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="m14.363 5.652l1.48-1.48a2 2 0 0 1 2.829 0l1.414 1.414a2 2 0 0 1 0 2.828l-1.48 1.48zm-1.414 1.414l-8.75 8.75a1 1 0 0 0-.263.464l-1.06 4.242a.5.5 0 0 0 .606.606l4.242-1.06a1 1 0 0 0 .464-.264l8.75-8.75z" />
    </svg>
  )
}

function Tag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M2 12.5c0-2.599 0-3.898.494-4.89A5 5 0 0 1 4.61 5.494C5.602 5 6.9 5 9.5 5h5c2.599 0 3.898 0 4.89.494a5 5 0 0 1 2.116 2.116C22 8.602 22 9.9 22 12.5s0 3.898-.494 4.89a5 5 0 0 1-2.116 2.116C18.398 20 17.1 20 14.5 20h-5c-2.599 0-3.898 0-4.89-.494a5 5 0 0 1-2.116-2.116C2 16.398 2 15.1 2 12.5" opacity=".5" />
      <path fill="currentColor" d="M8.5 14.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4" />
    </svg>
  )
}

function Budget() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M3 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0" opacity=".5" />
      <path fill="currentColor" d="M12 6.25a.75.75 0 0 1 .75.75v4.69l2.78 2.78a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1-.22-.53V7a.75.75 0 0 1 .75-.75" />
    </svg>
  )
}

function Repeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 3a9 9 0 0 1 8.66 6.53a.75.75 0 1 1-1.44.42A7.5 7.5 0 0 0 12 4.5a7.5 7.5 0 0 0-6.8 4.32a.75.75 0 1 1-1.36-.64A9 9 0 0 1 12 3" />
      <path fill="currentColor" d="M12 21a9 9 0 0 1-8.66-6.53a.75.75 0 1 1 1.44-.42A7.5 7.5 0 0 0 12 19.5a7.5 7.5 0 0 0 6.8-4.32a.75.75 0 1 1 1.36.64A9 9 0 0 1 12 21" opacity=".5" />
      <path fill="currentColor" d="M4.25 5.5a.75.75 0 0 1 1.5 0v3h3a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75zm15.5 13a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3.75a.75.75 0 0 1 .75.75z" />
    </svg>
  )
}

function Users() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M9.5 12a3.75 3.75 0 1 0 0-7.5a3.75 3.75 0 0 0 0 7.5" />
      <path fill="currentColor" d="M16 12.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6" opacity=".7" />
      <path fill="currentColor" d="M9.5 13.5c-3.314 0-6 1.79-6 4c0 1.105.895 1.5 2 1.5h8c1.105 0 2-.395 2-1.5c0-2.21-2.686-4-6-4" opacity=".5" />
      <path fill="currentColor" d="M16.5 13.75c-.69 0-1.34.09-1.93.25c1.24.86 2.03 2.07 2.03 3.5c0 .35-.06.69-.17 1H19c1.105 0 2-.395 2-1.5c0-1.79-2.015-3.25-4.5-3.25" opacity=".4" />
    </svg>
  )
}

export const MenuIcons = { Pencil, Tag, Budget, Repeat, Users }
