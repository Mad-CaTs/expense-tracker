'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'

type IconComponentType = React.ElementType<{ className?: string }>

export interface InteractiveMenuItem {
  label: string
  icon: IconComponentType
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[]
  accentColor?: string
  activeIndex?: number
  onItemClick?: (index: number) => void
}

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor = '#d4af37',
  activeIndex: controlledActive,
  onItemClick,
}) => {
  const [internalActive, setInternalActive] = useState(controlledActive ?? 0)
  const activeIndex = controlledActive ?? internalActive

  const textRefs = useRef<(HTMLElement | null)[]>([])
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const finalItems = useMemo(() => {
    if (!items || items.length < 2 || items.length > 5) return []
    return items
  }, [items])

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemEl = itemRefs.current[activeIndex]
      const activeTextEl = textRefs.current[activeIndex]
      if (activeItemEl && activeTextEl) {
        activeItemEl.style.setProperty('--lineWidth', `${activeTextEl.offsetWidth}px`)
      }
    }
    setLineWidth()
    window.addEventListener('resize', setLineWidth)
    return () => window.removeEventListener('resize', setLineWidth)
  }, [activeIndex, finalItems])

  const navStyle = useMemo(
    () => ({ '--component-active-color': accentColor }) as React.CSSProperties,
    [accentColor]
  )

  const handleClick = (index: number) => {
    setInternalActive(index)
    onItemClick?.(index)
  }

  return (
    <nav className="pockr-menu" role="navigation" aria-label="Navegación" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex
        const IconComponent = item.icon
        return (
          <button
            key={item.label}
            className={`pockr-menu__item${isActive ? ' active' : ''}`}
            onClick={() => handleClick(index)}
            ref={(el) => { itemRefs.current[index] = el }}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <div className="pockr-menu__icon">
              <IconComponent className="pockr-menu__icon-svg" />
            </div>
            <strong
              className={`pockr-menu__text${isActive ? ' active' : ''}`}
              ref={(el) => { textRefs.current[index] = el }}
            >
              {item.label}
            </strong>
          </button>
        )
      })}
    </nav>
  )
}

export { InteractiveMenu }
