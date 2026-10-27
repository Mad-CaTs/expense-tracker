/**
 * Título de una vista de la hoja de alcancías. Va dentro del contenido y no
 * en el `title` del Sheet: así desliza junto con su vista en vez de cambiar
 * de golpe arriba.
 */
export function SheetViewTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-2 text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
      {children}
    </p>
  )
}
