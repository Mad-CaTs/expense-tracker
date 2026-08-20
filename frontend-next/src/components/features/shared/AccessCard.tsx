'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

export interface AccessCardProps {
  title: string
  caption: string
  icon: React.ReactNode
  iconTint?: string
  chevron?: boolean
  wide?: boolean
  onClick?: () => void
}

export function AccessCard({ title, caption, icon, iconTint, chevron, wide, onClick }: AccessCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`liquid-glass relative flex min-w-0 flex-1 cursor-pointer items-center rounded-[20px] py-[13px] text-left transition-transform active:scale-[0.985] ${wide ? 'gap-3' : 'gap-2'}`}
      style={{ paddingLeft: wide ? 18 : 8, paddingRight: wide ? 18 : 3 }}
    >
      {/* Icono SIEMPRE a la izquierda y con marco cuadrado: todas las cards
          comparten el mismo lenguaje, la ancha solo escala el contenedor. */}
      <span
        className={`flex flex-none items-center justify-center${iconTint ? '' : ' liquid-glass-ic'} ${wide ? 'h-10 w-10 rounded-[12px]' : 'h-[28px] w-[28px] rounded-[9px]'}`}
        style={iconTint ? { background: `${iconTint}21`, color: iconTint } : { color: 'var(--text-primary)' }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        {/* En las estrechas el título baja a 14px: "Presupuestos" es el caso
            límite (97px medidos) y a 360px solo entra con estas métricas. */}
        <span
          className={`block truncate font-bold tracking-[-0.02em] ${wide ? 'text-[15px]' : 'text-[14px]'}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </span>
        {/* --text-tertiary y no --text-placeholder: el caption es un dato ("14
            activas"), no texto de relleno, y sobre el cristal de la card los
            tonos por debajo de este no se leían. */}
        <span
          className={`mt-0.5 block truncate ${wide ? 'text-[11.5px]' : 'text-[11px]'}`}
          style={{ color: 'var(--text-tertiary)' }}
        >
          {caption}
        </span>
      </span>
      {/* El chevron se encoge en las estrechas para no robarle ancho al título. */}
      {chevron && (
        <ChevronRight
          size={wide ? 18 : 14}
          className={`flex-none ${wide ? 'ml-1' : '-mr-0.5'}`}
          style={{ color: 'var(--text-muted)' }}
        />
      )}
    </button>
  )
}
