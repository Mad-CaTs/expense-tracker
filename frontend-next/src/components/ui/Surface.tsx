import type { CSSProperties, ReactNode } from 'react'

type Level = 1 | 2 | 3
type Radius = 'sm' | 'md' | 'lg' | 'xl'

const LEVEL_BG: Record<Level, string> = {
  1: 'var(--bg-base)',
  2: 'var(--surface-raised)',
  3: 'var(--surface-overlay)',
}

const RADIUS_VAR: Record<Radius, string> = {
  sm: 'var(--r-sm)',
  md: 'var(--r-md)',
  lg: 'var(--r-lg)',
  xl: 'var(--r-xl)',
}

interface SurfaceProps {
  level?: Level
  radius?: Radius
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Contenedor con elevación por luminancia, sin borde. */
export function Surface({ level = 2, radius = 'md', className = '', style, children }: SurfaceProps) {
  return (
    <div
      className={className}
      style={{ background: LEVEL_BG[level], borderRadius: RADIUS_VAR[radius], ...style }}
    >
      {children}
    </div>
  )
}

/** Surface con padding estándar para cards. */
export function Card({ level = 2, radius = 'md', className = '', style, children }: SurfaceProps) {
  return (
    <Surface level={level} radius={radius} className={`p-4 ${className}`} style={style}>
      {children}
    </Surface>
  )
}
